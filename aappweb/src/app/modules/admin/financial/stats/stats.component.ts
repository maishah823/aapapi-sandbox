import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AdminService} from '@admin/services/admin.service';
import {SocketService} from '@shared/services';
import * as moment from 'moment';


@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit, OnDestroy {

  stats: any = {};
  statsSub: Subscription;
  year: string;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private socketSvc: SocketService) {
  }

  ngOnInit() {

    this.year = moment().year().toString();
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
    this.adminSvc.getFinancialStats().subscribe(
      (res: any) => {
        this.stats = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
