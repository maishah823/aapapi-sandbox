import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {AddCouponDialogComponent} from '@admin/conference/coupons/dialogs/add-coupon-dialog/add-coupon-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.scss']
})
export class CouponsComponent implements OnInit {

  coupons = [];

  constructor(private dialog: MatDialog, private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getActiveCoupons();
  }

  getActiveCoupons() {
    this.adminSvc.getActiveCoupons().subscribe(
      (res: any) => {
        this.coupons = res;
        this.changeDet.markForCheck();
      }
    );
  }

  addCoupon() {
    this.dialog.open(AddCouponDialogComponent, {width: '400px'}).afterClosed().subscribe(
      (result: any) => {
        if (!result) {
          return;
        }
        this.adminSvc.createCoupon(result).subscribe(
          (res: any) => {
            this.getActiveCoupons();
          }
        );
      }
    );
  }

}
