import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WebService} from '../web.service';
import {environment} from '../../../../environments/environment';
import {Store} from '@ngrx/store';
import {SaveFileService} from 'app/main/save-file.service';

@Component({
  selector: 'app-conf-advert',
  templateUrl: './conf-advert.component.html',
  styleUrls: ['./conf-advert.component.scss']
})
export class ConfAdvertComponent implements OnInit {

  constructor(private files: SaveFileService, private store: Store<any>, private webSvc: WebService, private changeDet: ChangeDetectorRef) {
  }

  advertData: any = {conference: {}, instructors: [], events: [], titles: []};
  instructorImagesURL = environment.INSTRUCTOR_IMAGES;

  ngOnInit() {
    this.getAdvertData();
  }

  getAdvertData() {
    this.webSvc.getAdvertData().subscribe(
      (data: any) => {
        this.advertData = data;
        this.advertData.conference.memberPrice = parseFloat(this.advertData.conference.memberPrice || 0);
        this.advertData.conference.nonMemberPrice = parseFloat(this.advertData.conference.nonMemberPrice || 0);
        this.advertData.conference.memberEarlyPrice = parseFloat(this.advertData.conference.memberEarlyPrice || 0);
        this.advertData.conference.nonMemberEarlyPrice = parseFloat(this.advertData.conference.nonMemberEarlyPrice || 0);
        this.advertData.conference.guestPrice = parseFloat(this.advertData.conference.guestPrice || 0);
        this.changeDet.markForCheck();
      }
    );
  }

  downloadPdf() {
    this.webSvc.downloadPdfSchedule().subscribe(
      (res: any) => {
        this.files.saveOrView(res, 'AAPP_Conference_Schedule.pdf', 'application/pdf');
      }
    );

  }

}
