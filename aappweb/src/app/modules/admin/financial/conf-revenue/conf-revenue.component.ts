import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AdminService} from '@admin/services/admin.service';
import {SocketService} from '@shared/services';
import {ActivatedRoute} from '@angular/router';
import {UntypedFormControl, UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';

@Component({
  selector: 'app-conf-revenue',
  templateUrl: './conf-revenue.component.html',
  styleUrls: ['./conf-revenue.component.scss']
})
export class ConfRevenueComponent implements OnInit , OnDestroy{

  stats: any = {};
  statsSub: Subscription;
  form: UntypedFormGroup;

  conferences = [{_id: null, name: 'No Seminar'}];

  get conf() {
    return this.form.get('conf') as UntypedFormControl;
  }

  constructor(private route: ActivatedRoute, private fb: UntypedFormBuilder,
              private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private socketSvc: SocketService) {
  }

  ngOnInit() {

    this.conferences = this.route.snapshot.data.conferences;

    this.form = this.fb.group({
      conf: this.conferences[0]._id
    });

    this.statsSub = this.socketSvc.updateStats.subscribe(
      () => {
        this.getStats();
      }
    );

    this.getStats();
  }

  ngOnDestroy() {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }

  getStats() {
    this.adminSvc.getConfRevenue(this.conf.value).subscribe(
      (res: any) => {
        this.stats = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
