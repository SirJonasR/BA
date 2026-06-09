import { Component, OnInit } from '@angular/core';
import * as jsonData from '../../../../package.json'; // package.json from directory tecradar/frontend

@Component({
  selector: 'app-popup-info',
  templateUrl: './popup-info.component.html',
  styleUrls: ['./popup-info.component.css'],
})
/**
 * PopupInfo component
 *
 * Component that displays version info in a dialog window
 */
export class PopupInfoComponent implements OnInit {
  title = 'Aktuelle Version des TecRadars:';
  versionInfo = '';
  data = jsonData;

  ngOnInit(): void {
    this.versionInfo = this.data['version'];
  }
}
