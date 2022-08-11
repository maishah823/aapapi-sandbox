import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {SaveFileService} from 'app/main/save-file.service';
import {WindowAgentService} from 'app/main/window-agent.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {

  events: any = [];

  constructor(public devices: WindowAgentService, private files: SaveFileService, private changeDet: ChangeDetectorRef, private confService: ConfServiceService) {
  }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.confService.getClassroomEvents().subscribe(
      (events: any) => {
        this.events = events;
        this.changeDet.markForCheck();
      }
    );
  }

  downloadPdf() {
    this.confService.downloadPdfSchedule().subscribe(
      (res: any) => {
        this.files.saveOrView('res', 'AAPP_Conference_Schedule.pdf', 'application/pdf');
      }
    );

  }

}
