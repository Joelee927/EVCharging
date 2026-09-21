import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Search from '@arcgis/core/widgets/Search';

import { MapService } from '../../services/map.service';
import { EVService } from '../../services/ev.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="toolbar">

    <input
      #filterBox
      placeholder="State Name"
      />

    <button (click)="filter(filterBox.value)">
      Filter
    </button>

    <button (click)="clearFilter()">
      Clear
    </button>

  </div>

  <div
    #mapViewNode
    class="map-container">
  </div>
  `,
  styles: [`
    .map-container{
      height:100vh;
      width:100%;
    }

    .toolbar{
      position:absolute;
      top:15px;
      left:15px;
      z-index:99;
      background:white;
      padding:10px;
      border-radius:5px;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    }

    input{
      margin-right:10px;
    }
  `]
})
export class MapComponent
implements AfterViewInit {

  @ViewChild('mapViewNode', {
    static: true
  })
  mapViewEl!: ElementRef<HTMLDivElement>;

  constructor(
    private mapService: MapService,
    private poleService: EVService
  ) { }

  async ngAfterViewInit() {

    const view =
      await this.mapService.initialize(
        this.mapViewEl.nativeElement
      );

    const layer =
      this.poleService.loadLayer();

    view.map?.add(layer);

    const search = new Search({
      view
    });

    view.ui.add(search, 'top-right');
  }

  filter(state: string) {

    if (!state) {
      return;
    }

    this.poleService.getLayer()
      .definitionExpression =
      `areaname LIKE '%${state}%'`;
  }

  clearFilter() {

    this.poleService.getLayer()
      .definitionExpression = '';
  }
}