import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import {SocketService} from '@shared/services';
import {Subscription} from 'rxjs/Subscription';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnInit, OnDestroy {

  progressSub: Subscription;
  messages = [];
  showClose: boolean;

  constructor(public dialogRef: MatDialogRef<ProgressDialogComponent>,
              private socketSvc: SocketService, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.progressSub = this.socketSvc.attendProgress.filter(p => p.email == this.data.email).subscribe(
      (progress: any) => {
        if (progress.type == 'error' || progress.type == 'complete') {
          this.showClose = true;
        }
        this.messages.push(progress);
      }
    );
  }

  ngOnDestroy() {
    this.socketSvc.attendProgress.next({type: 'none', email: 'none', message: 'none'});
    if (this.progressSub) {
      this.progressSub.unsubscribe();
    }
  }

}
