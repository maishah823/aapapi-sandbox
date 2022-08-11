import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {User} from '@shared/classes';
import {EditableService} from '@shared/editable/editable.service';
import {Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {AddressUpdated, Logout} from '@shared/state';
import {PasswordChangeComponent} from '@shared/components/password-change/password-change.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;

  constructor(private store: Store<any>, private router: Router,
              private userSvc: UserService, private changeDet: ChangeDetectorRef,
              private editableSvc: EditableService, private matDialog: MatDialog) {
  }

  ngOnInit() {

    this.getSelf();
  }

  getSelf() {
    this.userSvc.getOwnUserData().subscribe(
      (user: User) => {
        this.user = user;
        this.changeDet.markForCheck();
      }
    );
  }

  updateEmail() {
    if (this.user.email) {
      this.editableSvc.editEmail('Edit Email', 'Provide an updated email address. If changed, you will be logged-out immediately and must log-in with your new email address.', this.user.email)
        .subscribe(
          (res: any) => {
            if (res && res != this.user.email) {
              this.userSvc.updateEmail(res).subscribe(
                () => {
                  this.store.dispatch(new Logout());
                  this.router.navigate(['/web']);
                }
              );
            }
          }
        );
    }
  }

  updateAddress() {
    this.editableSvc.editAddress('Update Address', 'Provide an updated address.', this.user.address)
      .subscribe(
        (res: any) => {
          if (res) {
            this.userSvc.updateAddress(res).subscribe(
              () => {
                this.user.address = res;
                this.store.dispatch(new AddressUpdated());
                this.getSelf();
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  resetPassword() {
    let dialogRef = this.matDialog.open(PasswordChangeComponent, {width: '500px'});
    dialogRef.afterClosed().subscribe(
      (password: any) => {
        if (password) {
          this.userSvc.resetPassword(password).subscribe(
            () => {
              this.store.dispatch(new Logout());
              this.router.navigate(['/web']);
            }
          );
        }
      }
    );
  }

  hasGroup(u, g) {
    if (u.groups.indexOf(g) > -1) {
      return true;
    }
    return false;
  }

}
