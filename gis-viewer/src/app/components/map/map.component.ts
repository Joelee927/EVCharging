import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Search from '@arcgis/core/widgets/Search';
import Zoom from '@arcgis/core/widgets/Zoom';
import Legend from '@arcgis/core/widgets/Legend';
import Expand from '@arcgis/core/widgets/Expand';
import FeatureTable from '@arcgis/core/widgets/FeatureTable';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';

import { MapService } from '../../services/map.service';
import { EVService } from '../../services/ev.service';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, AboutComponent],
  template: `
  <!-- Top Navigation Bar -->
  <header class="navbar">
    <div class="nav-brand">
      <span class="logo-icon">⚡</span>
      <span class="brand-title">EV Charging Explorer</span>
    </div>
    <nav class="nav-links">
      <button class="nav-item" [class.active]="!isAboutOpen" (click)="closeAbout()">Map View</button>
      <button class="nav-item" [class.active]="isAboutOpen" (click)="openAbout()">About</button>
    </nav>
  </header>

  <!-- Full-screen MapView Container -->
  <div #mapViewNode class="map-container"></div>

  <!-- Bottom Collapsible Attribute Table Drawer -->
  <div class="bottom-panel" [class.expanded]="isTableExpanded && !isAboutOpen">
    <button class="toggle-btn" (click)="toggleTable()">
      <span class="btn-icon">{{ isTableExpanded ? '▼' : '▲' }}</span>
      <span class="btn-text">{{ isTableExpanded ? 'Hide Attribute Table' : 'Show Attribute Table' }}</span>
    </button>
    <div #tableNode class="table-container"></div>
  </div>

  <!-- Standalone About Component Modal -->
  <app-about *ngIf="isAboutOpen" (closeEvent)="closeAbout()"></app-about>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Top Navigation Bar Styling */
    .navbar {
      height: 56px;
      background-color: #1e293b;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 200;
      flex-shrink: 0;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.5px;
    }

    .logo-icon {
      font-size: 20px;
      color: #38bdf8;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-item {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
      color: #ffffff;
      background-color: #0284c7;
    }

    /* Map View Container */
    .map-container {
      position: relative;
      flex: 1;
      width: 100%;
      height: calc(100vh - 56px);
    }

    /* Reset default Esri MapView surface margins and padding */
    ::ng-deep .esri-view,
    ::ng-deep .esri-view-surface {
      width: 100% !important;
      height: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Bottom Collapsible Drawer Panel */
    .bottom-panel {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      background: #ffffff;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      height: 350px;
    }

    .bottom-panel.expanded {
      transform: translateY(0);
    }

    .toggle-btn {
      position: absolute;
      top: -36px;
      left: 50%;
      transform: translateX(-50%);
      height: 36px;
      padding: 0 20px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 -3px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #333333;
      z-index: 101;
    }

    .toggle-btn:hover {
      background: #f5f5f5;
    }

    .btn-icon {
      font-size: 10px;
    }

    .table-container {
      height: 100%;
      width: 100%;
    }

    ::ng-deep .esri-feature-table {
      height: 100%;
      width: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit {

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

  async ngAfterViewInit() {
    this.view = await this.mapService.initialize(this.mapViewEl.nativeElement);
    this.view.ui.remove('zoom');

    // 1. Get the layer instance
    const layer = this.evService.loadLayer();

    // 2. Add layer to map
    this.view.map?.add(layer);

    // 3. Ensure layer is ready before querying features
    await layer.when();

    // 4. Set unique value renderer
    const uniqueValues = await this.getUniqueNetworkValues(layer, 'EV_Network');

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

    layer.renderer = new UniqueValueRenderer({
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
      layer: layer,
      container: this.tableEl.nativeElement,
      multipleSelectionEnabled: true,
      filterBySelectionEnabled: false
    });

    // 6. Filter FeatureTable rows to current MapView extent using view.watch
    this.view.watch('extent', (extent) => {
      if (extent && this.featureTable) {
        this.featureTable.filterGeometry = extent;
      }
    });

    // 7. UI Widgets Setup
    const search = new Search({ view: this.view });
    this.view.ui.add(search, 'top-left');

    const zoom = new Zoom({ view: this.view });
    this.view.ui.add(zoom, 'top-left');

    const legend = new Legend({
      view: this.view,
      layerInfos: [
        {
          layer: layer,
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