import { Injectable } from '@angular/core';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Injectable({
  providedIn: 'root'
})
export class EVService {

  private layer!: FeatureLayer;

  loadLayer() {

    this.layer = new FeatureLayer({

      url:
        'https://services.arcgis.com/wjcPoefzjpzCgffS/arcgis/rest/services/Electric_Charging_Stations_in_Canada/FeatureServer/0',

      outFields: ['*'],

      popupTemplate: {

        title: '{EV_Network}',

        content: [
          {
            type: 'fields',
            fieldInfos: [
              {
                fieldName: 'Groups_With_Access_Code',
                label: 'Access'
              },
              {
                fieldName: 'Access_Days_Time',
                label: 'Hours'
              },
              {
                fieldName: 'Street_Address',
                label: 'Address'
              },
              {
                fieldName: 'EV_Pricing',
                label: 'Price'
              },
              {
                fieldName: 'EV_Network_Web',
                label: 'EV Network Web'
              }
            ]
          }
        ]
      }
    });

    return this.layer;
  }

  getLayer() {
    return this.layer;
  }
}
``