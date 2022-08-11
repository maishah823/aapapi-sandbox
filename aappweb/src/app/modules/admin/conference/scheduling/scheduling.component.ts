import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ScheduleAddDialogComponent} from '@shared/components/schedule-add/dialogs/schedule-add-dialog.component';
import {AdminService} from '@admin/services/admin.service';
import {MatDialog} from '@angular/material/dialog';
import {TdDialogService} from '@covalent/core/dialogs';

@Component({
  selector: 'app-scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss']
})
export class SchedulingComponent implements OnInit {

  events: any = [];

  constructor(private dialog: MatDialog, private adminSvc: AdminService,
              private changeDet: ChangeDetectorRef, private tdDialog: TdDialogService) {
  }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.adminSvc.getClassroomEvents().subscribe(
      (events: any) => {
        this.events = events;
        this.changeDet.markForCheck();
      }
    );
  }

  addEvent(event?: any) {
    if (event) {
      this.adminSvc.getSingleClassroomEvent(event._id).subscribe(
        (res: any) => {
          let addDialog = this.dialog.open(ScheduleAddDialogComponent, {
            width: '98%',
            height: '98%',
            panelClass: 'add-schedule-dialog',
            data: {event: res}
          });
          addDialog.afterClosed().subscribe(
            (res: any) => {
              if (res) {
                this.getEvents();
              }
            }
          );
        }
      );

    } else {
      let addDialog = this.dialog.open(ScheduleAddDialogComponent, {
        width: '98%',
        height: '98%',
        panelClass: 'add-schedule-dialog',
        data: {event: null}
      });
      addDialog.afterClosed().subscribe(
        (res: any) => {
          if (res) {
            this.getEvents();
          }
        }
      );
    }
  }

  deleteEvent(event?: any) {
    this.tdDialog.openConfirm({
      message: 'You are about to DELETE this event. This cannot be undone. Are your sure you want to do this?',
      disableClose: false,
      cancelButton: 'No, Don\'t Delete',
      acceptButton: 'YES, DELETE NOW!',
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        console.log(event);
        this.adminSvc.deleteClass(event._id).subscribe(
          res => {
            this.getEvents();
          }
        );
      }
    });
  }
}
