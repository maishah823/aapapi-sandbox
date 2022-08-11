import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {UntypedFormGroup, UntypedFormControl, UntypedFormBuilder} from '@angular/forms';
import {SocketService} from '@shared/services';
import {AdminService} from '@admin/services/admin.service';
import {ConfirmPhoneDialogComponent} from '../confirm-phone-dialog/confirm-phone-dialog.component';
import {Subscription} from 'rxjs/Subscription';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.scss']
})
export class CheckInComponent implements OnInit, OnDestroy {

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
  }

  constructor(private dialog: MatDialog, private socket: SocketService,
              private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
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
    this.adminSvc.getAttendeesForCheckIn(this.page, this.limit, this.searchTerm.value).subscribe(
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

  checkIn(user) {
    const dialogRef = this.dialog.open(ConfirmPhoneDialogComponent, {data: {user: user}});

    dialogRef.afterClosed().subscribe(
      (options: { phone: string, textAuth: Boolean }) => {
        if (!options) {
          return;
        }
        if (!user.attendeeInfo || !user.attendeeInfo._id) {
          return;
        }
        let phone;
        if (!user.address) {
          user.address = {cellPhone: ''};
        }
        console.log(options.phone, user.address.cellPhone);
        if (user.address.cellPhone) {
          if (options.phone.replace(/[\D]/g, '') !== user.address.cellPhone.replace(/[\D]/g, '')) {
            phone = options.phone.replace(/[\D]/g, '');
          }
        } else {
          phone = options.phone.replace(/[\D]/g, '');
        }
        this.adminSvc.checkInAttendee(user._id, options.textAuth, phone)
          .subscribe(
            (res: any) => {
              user.attendeeInfo.checkedIn = true;
              this.changeDet.markForCheck();
            }
          );

      });
  }


}
