import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import esriConfig from '@arcgis/core/config.js';
import Search from '@arcgis/core/widgets/Search';
import Zoom from '@arcgis/core/widgets/Zoom';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import LayerList from '@arcgis/core/widgets/LayerList';
import FeatureTable from '@arcgis/core/widgets/FeatureTable';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

import { MapService } from '../../services/map.service';
import { EVService } from '../../services/ev.service';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    AboutComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mapViewNode', { static: true })
  mapViewEl!: ElementRef<HTMLDivElement>;

  @ViewChild('tableNode', { static: true })
  tableEl!: ElementRef<HTMLDivElement>;

  private view!: MapView;
  private featureTable!: FeatureTable;
  public isTableExpanded = false;
  public isAboutOpen = false;

  private networkColors: { [key: string]: string } = {
    'Tesla': '#E82127',
    'ChargePoint': '#FF6600',
    'BCHYDRO': '#00A3E0',
    'FLO': '#70BE44',
    'Electrify America': '#18B29C',
    'Shell Recharge': '#FFD500',
    'EVgo': '#2E5BFF',
    'SemaConnect': '#9C27B0',
    'Non-Networked': '#757575'
  };

  constructor(
    private mapService: MapService,
    private evService: EVService
  ) { }

  ngOnInit() { 
    esriConfig.apiKey = 'AAPTakfWrjrSi6qZyMNzOEA9Hyw..VCOBoAHTO_pJc6eFw6-q7BnX5OmVnzhTSensd0MIHyRIBXZ47lf5lP6_MPDrsY0Gd89GvUPJECfIiszcjJXx5DsIjco-EpZArpO_AMTdNjwoYTVp7_z58rdEky2Z0Z_yo33BqauQdhvD_nsKnTxWR9fLbJHr9XrjPcVBbXbeC-3jt_IKwXDQPO7UkU2-_TsnXBVplD5VfLQ91b0qEuKIZK9E1Wxwlkj7B5nXAZlzTugn6sCLBFYFsw..AT1_TVNX4kBy'
  }

  ngOnDestroy() {
    if (this.view) {
      this.view.destroy();
    }
  }

  async ngAfterViewInit() {
    this.view = await this.mapService.initialize(this.mapViewEl.nativeElement);
    this.view.ui.remove('zoom');

    // 1. Get the layer instance
    const evLayer = this.evService.loadLayer();
    evLayer.title = "Electric Charging Stations";

    // 2. Add layer to map
    this.view.map?.add(evLayer, 1);

    const trafficLayer = new MapImageLayer({
      url: "https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer",
      dpi: 48,
      imageFormat: "png32",
      refreshInterval: 1,
      useViewTime: false
    });

    this.view.map?.add(trafficLayer, 0);

    // 3. Ensure layer is ready before querying features
    await evLayer.when();

    // 4. Set unique value renderer
    const uniqueValues = await this.getUniqueNetworkValues(evLayer, 'EV_Network');

    const uniqueValueInfos = uniqueValues.map((network, index) => {
      const color = this.networkColors[network] || this.getRandomColor(index, uniqueValues.length);
      return {
        value: network,
        label: network || 'Unknown Network',
        symbol: new SimpleMarkerSymbol({
          color: color,
          size: 8,
          outline: { color: 'white', width: 1 }
        })
      };
    });

    evLayer.renderer = new UniqueValueRenderer({
      field: 'EV_Network',
      defaultSymbol: new SimpleMarkerSymbol({
        color: '#9E9E9E',
        size: 6,
        outline: { color: 'white', width: 0.5 }
      }),
      defaultLabel: 'Other / Unknown',
      uniqueValueInfos: uniqueValueInfos
    });

    // 5. Bind FeatureTable to bottom panel element
    this.featureTable = new FeatureTable({
      view: this.view,
      layer: evLayer,
      container: this.tableEl.nativeElement,
      multipleSelectionEnabled: true,
      filterBySelectionEnabled: false
    });

    // 6. Filter FeatureTable rows to current MapView extent using view.watch
    reactiveUtils.when(
      () => this.view.stationary,
      () => {
        if (this.view.extent && this.featureTable) {
          this.featureTable.filterGeometry = this.view.extent;
        }
      }
    );

    // 7. UI Widgets Setup
    const search = new Search({ view: this.view });
    this.view.ui.add(search, 'top-left');

    const zoom = new Zoom({ view: this.view });
    this.view.ui.add(zoom, 'top-left');

    const legend = new Legend({
      view: this.view,
      layerInfos: [
        {
          layer: evLayer,
          title: 'EV Networks'
        }
      ]
    });

    const legendExpand = new Expand({
      view: this.view,
      content: legend,
      expanded: false,
      expandIcon: 'legend',
      group: 'top-right'
    });

    this.view.ui.add(legendExpand, 'top-right');

    // Create the BasemapGallery widget bound to your MapView
    const basemapGallery = new BasemapGallery({
      view: this.view
    });

    // Wrap BasemapGallery inside an Expand container
    const basemapExpand = new Expand({
      view: this.view,
      content: basemapGallery,
      expanded: false,
      expandIcon: 'basemap', // Uses Esri Calcite basemap icon
      group: 'top-right'     // Grouping ensures opening legend closes basemap, and vice-versa
    });

    // Add widget to UI layout
    this.view.ui.add(basemapExpand, 'top-right');

    const layerList = new LayerList({
      view: this.view
    });

    const layerListExpand = new Expand({
      view: this.view,
      content: layerList,
      expanded: false,
      expandIcon: 'layers', // Uses Calcite layers icon
      group: 'top-right'    // Keeps it grouped so clicking it collapses others
    });

    this.view.ui.add(layerListExpand, 'top-right');
  }

  toggleTable() {
    this.isTableExpanded = !this.isTableExpanded;
  }

  openAbout() {
    this.isAboutOpen = true;
  }

  closeAbout() {
    this.isAboutOpen = false;
  }

  private async getUniqueNetworkValues(layer: any, fieldName: string): Promise<string[]> {
    try {
      const query = layer.createQuery();
      query.where = '1=1';
      query.outFields = [fieldName];
      query.returnDistinctValues = true;
      query.returnGeometry = false;

      const result = await layer.queryFeatures(query);
      return result.features
        .map((feature: any) => feature.attributes[fieldName])
        .filter((val: string) => val !== null && val !== undefined);
    } catch (e) {
      return ['Tesla', 'ChargePoint', 'BCHYDRO', 'FLO', 'EVgo', 'Electrify America', 'Shell Recharge'];
    }
  }

  private getRandomColor(index: number, total: number): string {
    const hue = (index * (360 / Math.max(total, 1))) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
}