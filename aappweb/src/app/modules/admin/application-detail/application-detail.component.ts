import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {Store} from '@ngrx/store';
import {User} from '@shared/classes';
import {RejectionReasonComponent} from '@shared/components/rejection-reason/rejection-reason.component';
import {SaveFileService} from 'app/main/save-file.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.scss']
})
export class ApplicationDetailComponent implements OnInit {

  application: any = {user: {address: {}}};
  showButtons = false;
  applicationStatus = 'Unknown';
  user: User;
  paid = false;

  constructor(private files: SaveFileService, private dialog: MatDialog,
              private store: Store<any>, private adminSvc: AdminService,
              private route: ActivatedRoute, private changeDet: ChangeDetectorRef, private location: Location) {
  }

  ngOnInit() {
    this.store.select('user').take(1).subscribe(
      (user: User) => {
        this.user = user;
      }
    );
    this.getApplication(this.route.snapshot.params['id']);
  }

  getApplication(id) {
    this.application = {user: {address: {}}};
    this.showButtons = false;
    this.applicationStatus = 'Pending Regional Approval';
    this.adminSvc.applicationDetail(id).subscribe(
      (res: any) => {
        if (!res) {
          this.location.back();
        }
        this.application = res;
        if (!this.application.invoiceRef) {
          this.applicationStatus = 'INVOICE ISSUE, CONTACT SUPPORT';
          this.showButtons = false;
        } else {
          if (!this.application.invoiceRef.paid) {
            this.applicationStatus = 'UNPAID';
            this.showButtons = false;
          } else {
            this.paid = true;
          }
        }

        if (this.application.regionApproved) {
          this.applicationStatus = 'Approved in Region, Awaiting Final Approval';
        }
        if (this.application.finalApproved) {
          this.applicationStatus = 'APPROVED';
        }
        if (this.application.rejected) {
          this.applicationStatus = 'REJECTED';
        }
        if (this.user.isAdmin && this.user.groups.indexOf('final-approval') > -1) {
          if ((!this.application.finalApproved || !this.application.regionApproved) && this.paid) {
            this.showButtons = true;
          }
        } else if (this.user.isAdmin && this.user.groups.indexOf('regional-manager') > -1) {
          if (!this.application.regionApproved && this.paid) {
            this.showButtons = true;
          }
        }
        if (this.application.rejected) {
          this.showButtons = false;
        }
        this.changeDet.markForCheck();
      }
    );
  }

  approve() {
    this.adminSvc.approve(this.application._id).subscribe(
      (res: any) => {
        this.getApplication(this.route.snapshot.params['id']);
      }
    );
  }

  deny() {
    let dialogRef = this.dialog.open(RejectionReasonComponent, {});

    dialogRef.afterClosed().subscribe(
      (reason: string) => {
        this.adminSvc.deny(this.application._id, reason).subscribe(
          (res: any) => {
            this.getApplication(this.route.snapshot.params['id']);
          }
        );
      }
    );

  }

  downloadApp() {

    if (!this.application || !this.application._id) {
      return;
    }

    this.adminSvc.downloadApplication(this.application._id).subscribe(
      (pdf: any) => {
        this.files.saveOrView(pdf, 'AAPP_Application_' + this.application.user.lastName + '.pdf', 'application/pdf');
      }
    );
  }


}
