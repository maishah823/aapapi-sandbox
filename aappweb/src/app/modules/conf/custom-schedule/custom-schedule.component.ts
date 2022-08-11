import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {SaveFileService} from 'app/main/save-file.service';
import {WindowAgentService} from 'app/main/window-agent.service';
import {TdDialogService} from '@covalent/core/dialogs';

@Component({
  selector: 'app-custom-schedule',
  templateUrl: './custom-schedule.component.html',
  styleUrls: ['./custom-schedule.component.scss']
})
export class CustomScheduleComponent implements OnInit {

  constructor(public devices: WindowAgentService, private files: SaveFileService,
              private confSvc: ConfServiceService, private changeDet: ChangeDetectorRef,
              private dialog: TdDialogService) {
  }

  events = [];

  ngOnInit() {
    this.getCustomSchedule();
  }

  getCustomSchedule() {
    this.confSvc.getCustomSchedule()
      .subscribe(
        (result: any) => {
          this.events = result;
          this.changeDet.markForCheck();
        }
      );
  }

  delete(event) {
    this.dialog.openConfirm({
      message: 'Are you sure you want to remove this class?',
      disableClose: false,
      cancelButton: 'No',
      acceptButton: 'YES, REMOVE.',
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {

        this.confSvc.removeClassFromCustomSchedule(event._id).subscribe(
          res => {
            this.getCustomSchedule();
          }
        );
      }
    });
  }

  downloadPdf() {
    this.confSvc.downloadCustomSchedule().subscribe(
      (res: any) => {
        this.files.saveOrView(res, 'AAPP_Custom_Schedule.pdf', 'application/pdf');
      }
    );

  }

}
