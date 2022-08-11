import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {SocketService} from '@shared/services';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  stats: any = {};
  statsSub: Subscription;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private socketSvc: SocketService) {
  }

  ngOnInit() {
    this.getStats();
    this.statsSub = this.socketSvc.updateStats.subscribe(
      () => {
        this.getStats();
      }
    );
  }

  ngOnDestroy() {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }

  getStats() {
    this.adminSvc.getConfStats().subscribe(
      (res: any) => {
        this.stats = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
