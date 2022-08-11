import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {TdMediaService} from '@covalent/core/media';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  isDeveloper = false;

  constructor(public media: TdMediaService, private store: Store<any>) {
  }

  ngOnInit() {
    this.store.select('user').take(1).map(user => user.isDeveloper).subscribe(
      isDeveloper => {
        this.isDeveloper = isDeveloper;
      }
    );
  }

}
