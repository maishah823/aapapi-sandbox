import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {SocketService} from '@shared/services';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormGroup, UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {RejectionReasonComponent} from '@shared/components/rejection-reason/rejection-reason.component';
import {UserMatchComponent} from './modals/user-match/user-match.component';
import {MatDialog} from '@angular/material/dialog';
import {TdDialogService} from '@covalent/core/dialogs';

@Component({
  selector: 'app-attendees',
  templateUrl: './attendees.component.html',
  styleUrls: ['./attendees.component.scss']
})
export class AttendeesComponent implements OnInit, OnDestroy {

  attendees: any;
  attendeesSub: Subscription;
  searchTermSub: Subscription;

  searchForm: UntypedFormGroup;

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  };

  constructor(private dialog: MatDialog, private socket: SocketService,
              private adminSvc: AdminService,
              private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder, private tdDialog: TdDialogService) {
  }

  ngOnInit() {

    this.searchForm = this.fb.group({
      search: '',
    });

    this.attendeesSub = this.socket.attendeesChanged.subscribe(
      () => {

        this.getAttendees();
      }
    );

    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.page = 1;
        this.getAttendees();
      }
    );

    this.getAttendees();

  }

  ngOnDestroy() {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
    if (this.attendeesSub) {
      this.attendeesSub.unsubscribe();
    }
  }

  getAttendees() {
    this.adminSvc.getAttendees(this.page, this.limit, this.searchTerm.value).subscribe(
      (res: any) => {
        this.attendees = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getAttendees();
  }

  approve(user) {
    let dialogRef = this.dialog.open(UserMatchComponent, {
      data: {
        lastName: user.lastName,
        firstName: user.firstName,
        address: user.address,
        email: user.email
      }
    });

    dialogRef.afterClosed().subscribe(
      (memberId: string) => {
        if (memberId) {
          if (memberId === 'non-member') {
            this.adminSvc.approveAttendee(user._id).subscribe(
              (res: any) => {
                if (res.attendee) {
                  user.attendeeInfo = res.attendee;
                  user.isAttendee = true;
                  user.attendeePending = false;
                }
              }
            );
          } else {
            this.tdDialog.openConfirm({
              message: 'This action will delete one user and migrate to the other. ' +
                'This action is irreversible and can cause severe damage if not intentional. Do you really want to do this?',
              title: 'Are you sure?',
              cancelButton: 'No',
              acceptButton: 'YES',
            }).afterClosed().subscribe((accept: boolean) => {
              if (accept) {
                this.adminSvc.linkMember(user._id, memberId).subscribe(
                  () => {
                    this.getAttendees();
                  }
                );
              }
            });

          }
        }
      });
  }

  reject(user) {
    const dialogRef = this.dialog.open(RejectionReasonComponent, {});

    dialogRef.afterClosed().subscribe(
      (reason: string) => {
        if (!reason) {
          return;
        }
        this.adminSvc.rejectAttendee(user._id, reason).subscribe(
          (res: any) => {
            if (res.attendee) {
              user.attendeeInfo = res.attendee;
              user.isAttendee = false;
              user.attendeePending = false;
            }
          }
        );
      }
    );

  }

  checkIn(user) {
    // TODO: Check the data... can't check in before conference start.
    if (!user.attendeeInfo || !user.attendeeInfo._id) {
      return;
    }
    this.adminSvc.checkInAttendee(user.attendeeInfo._id, null, null)
      .subscribe(
        (res: any) => {
          user.attendeeInfo.checkedIn = true;
          if (res.checkedInBy) {
            user.attendeeInfo.checkedInBy = {fullname: res.checkedInBy};
          }
        }
      );
  }

  refund(id) {
    this.adminSvc.refundAttendee(id)
      .subscribe(
        (res: any) => {
          this.getAttendees();
        });
  }


}
