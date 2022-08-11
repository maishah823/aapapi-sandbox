import { Component, OnInit } from '@angular/core';
import { version } from 'environments/version';

@Component({
  selector: 'app-dev-info',
  templateUrl: './dev-info.component.html',
  styleUrls: ['./dev-info.component.scss']
})
export class DevInfoComponent implements OnInit {

  version = `${version.major}.${version.minor}.${version.build}`;

  constructor() { }

  ngOnInit() {
  }

}
