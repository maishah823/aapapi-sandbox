import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {fade} from '@shared/animations';

@Component({
  selector: 'app-attend',
  templateUrl: './attend.component.html',
  styleUrls: ['./attend.component.scss'],
  animations: [fade]
})
export class AttendComponent implements OnInit {

  answered = false;

  constructor(private router: Router) {
  }

  ngOnInit() {
    let routeArray = this.router.routerState.snapshot.url.split('/');
    if (routeArray[routeArray.length - 1] != 'attend') {
      this.answered = true;
    }
  }

    selectionChange(e) {
    e.source.selectedOptions._multiple = false;
    switch (e.options[0].value) {
      case 'individual':
        this.router.navigate(['/web/public/attend/individual']);
        break;
      case 'agency':
        this.router.navigate(['/web/public/attend/agency']);
        break;
      case 'vendor':
        this.router.navigate(['/web/public/attend/vendor']);
        break;

    }
    this.answered = true;
  }

}
