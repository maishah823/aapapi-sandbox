import {Component, OnInit} from '@angular/core';
import {TdMediaService} from '@covalent/core/media';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  constructor(public media: TdMediaService) {
  }

  ngOnInit() {
  }

}
