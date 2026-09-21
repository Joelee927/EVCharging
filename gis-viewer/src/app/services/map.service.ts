import { Injectable } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private view!: MapView;

  async initialize(container: HTMLDivElement): Promise<MapView> {
    // 1. Initialize 2D Map with standard vector basemap
    const map = new Map({
      basemap: 'topo-vector' // Options: 'streets-vector', 'satellite', 'dark-gray-vector', 'hybrid'
    });

    // 2. Setup 2D MapView
    this.view = new MapView({
      container: container,
      map: map,
      center: [-123.1207, 49.2827], // Vancouver, BC
      zoom: 12
    });

    await this.view.when();
    return this.view;
  }
}