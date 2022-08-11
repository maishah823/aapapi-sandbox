import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {Router} from '@angular/router';
import {SaveFileService} from 'app/main/save-file.service';
import {WindowAgentService} from 'app/main/window-agent.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {

  events: any = [];

  constructor(public devices: WindowAgentService, private files: SaveFileService,
              private changeDet: ChangeDetectorRef, private confService: ConfServiceService,
              private router: Router) {
  }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.confService.getCombinedEvents().subscribe(
      (events: any) => {
        this.events = events;
        this.changeDet.markForCheck();
      }
    );
  }


  gotToDetail(event) {
    console.log(event);
    if (event.isClass) {
      this.router.navigate(['/web/conf/schedule', event._id]);
    }
  }

  downloadPdf() {
    this.confService.downloadPdfSchedule().subscribe(
      (res: any) => {
        this.files.saveOrView(res, 'AAPP_Conference_Schedule.pdf', 'application/pdf');
      }
    );

  }

}
