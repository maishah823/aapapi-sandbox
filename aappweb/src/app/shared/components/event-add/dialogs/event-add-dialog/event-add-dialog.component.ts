import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-event-add-dialog',
  templateUrl: './event-add-dialog.component.html',
  styleUrls: ['./event-add-dialog.component.scss']
})
export class EventAddDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EventAddDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
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
