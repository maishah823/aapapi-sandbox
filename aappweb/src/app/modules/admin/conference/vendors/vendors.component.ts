import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {RejectionReasonComponent} from '@shared/components/rejection-reason/rejection-reason.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {

  vendors = [];

  constructor(private changeDet: ChangeDetectorRef, private adminSvc: AdminService, private dialog: MatDialog) {
  }

  ngOnInit() {
    this.getVendors();
  }

  getVendors() {
    this.adminSvc.getVendors().subscribe(
      (res: any) => {
        this.vendors = res;
        this.changeDet.markForCheck();
      }
    );
  }

  approve(rep) {
    this.adminSvc.approveRep(rep._id).subscribe(
      (res: any) => {

        rep.finalApproved = true;
        rep.finalApprovedOn = new Date();
        this.changeDet.markForCheck();
      }
    );
  }

  reject(rep) {
    let dialogRef = this.dialog.open(RejectionReasonComponent, {});
    dialogRef.afterClosed().subscribe(
      (reason: string) => {
        if (!reason) {
          return;
        }
        this.adminSvc.rejectRep(rep._id, reason).subscribe(
          (res: any) => {

            rep.rejected = true;
            rep.rejectedOn = new Date();
            rep.rejectedReason = reason;
            this.changeDet.markForCheck();
          }
        );
      }
    );
  }

}
