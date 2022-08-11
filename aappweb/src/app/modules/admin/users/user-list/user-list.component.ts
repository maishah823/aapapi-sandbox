import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {DropdownService} from '@admin/services/dropdown.service';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {AddAlert, UserState} from '@shared/state';
import {PasswordChangeComponent} from '@shared/components/password-change/password-change.component';
import {LevelComponent} from '@shared/components/level/level.component';
import {EditableService} from '@shared/editable/editable.service';
import {Address} from '@shared/classes/Address';
import {AlertTypes, User} from '@shared/classes';
import {InvoiceDialogComponent} from '../invoice-dialog/invoice-dialog.component';
import {Subscription} from 'rxjs/Subscription';
import {TdMediaService} from '@covalent/core/media';
import {TdDialogService} from '@covalent/core/dialogs';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: any[] = [];
  currentUser: Observable<UserState>;
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  searchForm: UntypedFormGroup;
  schoolForm: UntypedFormGroup;

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  get type(): UntypedFormControl {
    return this.searchForm.get('type') as UntypedFormControl;
  }

  get showSuspended(): UntypedFormControl {
    return this.searchForm.get('showSuspended') as UntypedFormControl;
  }

  searchTermSub: Subscription;
  typeSub: Subscription;
  showSuspendedSub: Subscription;

  schools: any[] = [];

  constructor(private editableSvc: EditableService, private store: Store<any>,
              private adminSvc: AdminService, public media: TdMediaService,
              private changeDet: ChangeDetectorRef, private dropdownSvc: DropdownService,
              private fb: UntypedFormBuilder, private dialog: TdDialogService, private matDialog: MatDialog) {
  }

  ngOnInit() {

    this.currentUser = this.store.select('user');

    this.searchForm = this.fb.group({
      search: '',
      type: '',
      showSuspended: false
    });
    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.page = 1;
        this.getUserList();
      }
    );
    this.typeSub = this.type.valueChanges.subscribe(
      (val: string) => {
        this.page = 1;
        this.getUserList();
      }
    );
    this.showSuspendedSub = this.showSuspended.valueChanges.subscribe(
      (val: boolean) => {
        this.page = 1;
        this.getUserList();
      }
    );
    this.getUserList();
    this.getSchoolsDropdown();
  }

  ngOnDestroy() {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
    if (this.showSuspendedSub) {
      this.showSuspendedSub.unsubscribe();
    }
  }

  updateEmail(user) {
    if (user.email) {
      this.editableSvc.
      editEmail('Edit Email', 'Provide an updated new email address. Have the user log out and log back in with the new email.',
        user.email)
        .subscribe(
          (res: any) => {
            if (res && res !== user.email) {
              this.adminSvc.updateEmail(user._id, res).subscribe(
                () => {
                  user.email = res;
                  this.changeDet.markForCheck();
                }
              );
            }
          }
        );
    }
  }

  updateFirstName(user) {
    if (user.firstName) {
      this.editableSvc.editText('Edit First Name', 'Change the user\'s first name.', user.firstName)
        .subscribe(
          (res: any) => {
            if (res && res !== user.firstName) {
              this.adminSvc.updateName(user._id, res, user.lastName).subscribe(
                () => {
                  user.firstName = res;
                  this.changeDet.markForCheck();
                }
              );
            }
          }
        );
    }
  }

  updateLastName(user) {
    if (user.lastName) {
      this.editableSvc.editText('Edit Last Name', 'Change the user\'s last name.', user.lastName)
        .subscribe(
          (res: any) => {
            if (res && res !== user.lastName) {
              this.adminSvc.updateName(user._id, user.firstName, res).subscribe(
                () => {
                  user.lastName = res;
                  this.changeDet.markForCheck();
                }
              );
            }
          }
        );
    }
  }

  getUserList() {
    this.adminSvc.getUsers(this.page, this.limit, this.type.value, this.searchTerm.value, this.showSuspended.value).subscribe(
      (res: any) => {
        this.users = res.docs;
        console.log(res);
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  getSchoolsDropdown() {
    this.dropdownSvc.schools().subscribe(
      (res: any) => {
        this.schools = res;
        this.changeDet.markForCheck();
      }
    );
  }

  isEducatorChanged(user, val) {
    if (!val) {
      // Call server and remove permission and school.
      this.adminSvc.removeSchoolAdmin(user._id).subscribe(
        () => {
          user.isEducator = false;
          user.adminForSchool = null;
          this.changeDet.markForCheck();
        }
      );
    }
  }

  schoolChanged(userId, schoolId) {
    // Call server, add permission and set school.
    this.adminSvc.addSchoolAdminPermission(userId, schoolId).subscribe(
      () => {

      }
    );
  }

  regionalManagerChanged(user, val) {
    if (!val) {
      this.dialog.openConfirm({
        message: 'You are about to UNASSIGN this person as a regional manager. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.revokeRegionalManager(user._id).subscribe(
            () => {
              user.groups.slice(user.groups.indexOf('regional-manager'), 1);
              this.changeDet.markForCheck();
            }
          );
        }
      });
    } else {
      this.dialog.openConfirm({
        message: 'You are about to make this user an REGIONAL MANAGER. Are you sure you really want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.makeRegionalManager(user._id).subscribe(
            () => {
              user.groups.push('regional-manager');
              this.changeDet.markForCheck();
            }
          );
        }
      });
    }
  }

  instructorChanged(user, val) {
    if (!val) {
      this.dialog.openConfirm({
        message: 'You are about to DELETE this user\'s instructor credentials. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.revokeInstructor(user._id).subscribe(
            () => {
              user.isInstructor = false;
              this.changeDet.markForCheck();
            }
          );
        }
      });
    } else {
      this.dialog.openConfirm({
        message: 'You are about to make this user an INSTRUCTOR. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.makeInstructor(user._id).subscribe(
            () => {
              user.isInstructor = true;
              this.changeDet.markForCheck();
            }
          );
        }
      });
    }
  }

  toggleAdmin(user) {
    if (user.isAdmin) {
      this.dialog.openConfirm({
        message: 'You are about to remove ADMIN permission from this user. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.revokeAdmin(user._id).subscribe(
            () => {
              user.isAdmin = false;
              this.changeDet.markForCheck();
            }
          );
        }
      });
    } else {
      this.dialog.openConfirm({
        message: 'You are about to make this user an ADMIN. Are you sure you really want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.makeAdmin(user._id).subscribe(
            () => {
              user.isAdmin = true;
              this.changeDet.markForCheck();
            }
          );
        }
      });
    }


  }

  toggleSuspension(user) {
    if (user.active) {
      this.dialog.openConfirm({
        message: 'You are about to SUSPEND this user. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.suspendUser(user._id).subscribe(
            () => {
              user.active = false;
              this.changeDet.markForCheck();
            }
          );
        }
      });

    } else {
      this.dialog.openConfirm({
        message: 'You are about to REINSTATE this suspended user. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.reinstateUser(user._id).subscribe(
            () => {
              user.active = true;
              this.changeDet.markForCheck();
            }
          );
        }
      });
    }
  }

  toggleDelinquentDues(user) {
      this.dialog.openConfirm({
        message: 'You are about to toggle user status as Delinquent Dues. Are you sure you want to do this?',
        title: 'Are you sure?',
        cancelButton: 'No',
        acceptButton: 'YES',
      }).afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.adminSvc.toggleDelinquentDues(user._id, user.isDelinquentDues !== true).subscribe(
            () => {
              user.isDelinquentDues = !user.isDelinquentDues
              this.changeDet.markForCheck();
            }
          );
        }
      });

  }

  resetPassword(user) {
    const dialogRef = this.matDialog.open(PasswordChangeComponent);
    dialogRef.afterClosed().subscribe(
      (password: any) => {
        if (password) {
          this.adminSvc.resetPassword(user._id, password).subscribe();
        }
      }
    );
  }

  changeLevel(user) {
    const dialogRef = this.matDialog.open(LevelComponent, {data: {level: user.memberLevel, name: user.fullname}});
    dialogRef.afterClosed().subscribe(
      (level: any) => {
        if (level && level !== user.memberLevel) {
          this.adminSvc.changeLevel(user._id, level).subscribe(
            () => {
              user.memberLevel = level;
              this.changeDet.markForCheck();
            }
          );
        }
      }
    );
  }

  updateAddress(user) {
    this.editableSvc.editAddress('Update Address', 'Provide an updated address.', user.address)
      .subscribe(
        (res: Address) => {
          if (res) {
            this.adminSvc.updateUsersAddress(user._id, res).subscribe(
              () => {
                user.address = res;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  updateCertNumber(user) {
    this.editableSvc.editText(user.fullname, 'Provide a valid certification number.', user.certNumber)
      .subscribe(
        (res: string) => {
          if (res) {
            this.adminSvc.updateCertNumber(user._id, res).subscribe(
              () => {
                user.certNumber = res;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  updateCertExpiration(user) {

    this.editableSvc.editText(user.fullname, 'Provide the cert expiration year.', user.certYear)
      .subscribe(
        (res: any) => {
          if (res) {
            this.adminSvc.updateCertYear(user._id, res).subscribe(
              (info: any) => {
                user.certExpiration = info.expiration;
                user.certYear = info.year;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  createInvoice(user) {

    let dialogRef = this.matDialog.open(InvoiceDialogComponent, {width: '500px', data: {name: user.fullname}});
    dialogRef.afterClosed().subscribe(
      (data: any) => {
        if (data && data.amount && data.description && data.type) {
          this.adminSvc.createArbitraryInvoice(user._id, data.amount, data.description, data.type).subscribe(() => {
            this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'Invoice', message: 'New invoice has been generated.'}));
          });
        }
      }
    );


  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getUserList();
  }

  hasGroup(u, g) {
    if (u.groups.indexOf(g) > -1) {
      return true;
    }
    return false;
  }

}
