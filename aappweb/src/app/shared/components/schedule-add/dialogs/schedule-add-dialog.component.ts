import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-add-dialog',
  templateUrl: './schedule-add-dialog.component.html',
  styleUrls: ['./schedule-add-dialog.component.scss']
})
export class ScheduleAddDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ScheduleAddDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  saved(e) {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }

}
