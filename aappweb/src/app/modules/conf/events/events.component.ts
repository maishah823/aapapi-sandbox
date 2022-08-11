import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  events: any = [];

  constructor(private changeDet: ChangeDetectorRef, private confService: ConfServiceService) {
  }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.confService.getEvents().subscribe(
      (events: any) => {
        this.events = events;
        this.changeDet.markForCheck();
      }
    );
  }

}
