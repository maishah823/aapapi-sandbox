import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';

import {AdminService} from '@admin/services/admin.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-comments-dialog',
  templateUrl: './comments-dialog.component.html',
  styleUrls: ['./comments-dialog.component.scss']
})
export class CommentsDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CommentsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private adminSvc: AdminService,
              private changeDet: ChangeDetectorRef) {
  }

  comments = {total: 0, _id: 'No Comments', comments: []};

  ngOnInit() {
    this.getComments();
  }

  getComments() {
    this.adminSvc.commentsByClass(this.data.classId, this.data.type).subscribe(
      (res: any) => {
        this.comments = res;
        this.changeDet.markForCheck();

      }
    );
  }

  close() {
    this.dialogRef.close();
  }

}
