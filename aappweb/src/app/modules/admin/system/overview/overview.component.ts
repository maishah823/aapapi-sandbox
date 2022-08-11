import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {Subscription} from 'rxjs/Subscription';
import {SocketService} from '@shared/services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {

  stats = {totalMembers: 0, needsUpdate: 0};
  memberUpdatesSub: Subscription;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private socket: SocketService) {
  }

  ngOnInit() {
    this.memberUpdatesSub = this.socket.memberUpdatesChanged.subscribe(
      () => {
        this.getStats();
      }
    );
    this.getStats();
  }

  ngOnDestroy() {
    if (this.memberUpdatesSub) {
      this.memberUpdatesSub.unsubscribe();
    }
  }

  getStats() {
    this.adminSvc.getSystemStats().subscribe(
      (res: any) => {
        if (res) {
          this.stats = res;
          this.changeDet.markForCheck();

        }
      }
    );
  }

}
