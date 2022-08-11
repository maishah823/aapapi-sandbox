import {Injectable} from '@angular/core';
import {EditEmailComponent} from './dialogs/edit-email/edit-email.component';
import {Observable} from 'rxjs/Observable';
import {EditDateComponent} from '@shared/editable/dialogs/edit-date/edit-date.component';
import {Address} from '@shared/classes/Address';
import {EditAddressComponent} from '@shared/editable/dialogs/edit-address/edit-address.component';
import {EditTextComponent} from '@shared/editable/dialogs/edit-text/edit-text.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable()
export class EditableService {

  constructor(private dialog: MatDialog) {
  }

  editEmail(title: string, msg: string, prepopulated?: string) {
    const emailDialogRef = this.dialog.open(EditEmailComponent, {
      data: {
        title: title,
        message: msg,
        prepopulated: prepopulated
      },
      hasBackdrop: true,
      width: '400px'
    });
    return emailDialogRef.afterClosed().switchMap(
      (res: string) => {
        if (res !== prepopulated) {
          return Observable.of(res);
        } else {
          return Observable.of(null);
        }
      }
    );
  }

  editDate(title: string, msg: string, placeholder: string, prepopulated?: Date) {
    const emailDialogRef = this.dialog.open(EditDateComponent, {
      data: {
        title: title,
        message: msg,
        prepopulated: prepopulated
      },
      hasBackdrop: true,
      width: '400px'
    });
    return emailDialogRef.afterClosed().switchMap(
      (res: Date) => {
        if (res !== prepopulated) {
          return Observable.of(res);
        } else {
          return Observable.of(null);
        }
      }
    );
  }

  editAddress(title: string, msg: string, prepopulated?: Address) {
    const addressDialogRef = this.dialog.open(EditAddressComponent, {
      data: {
        title: title,
        message: msg,
        prepopulated: prepopulated
      },
      hasBackdrop: true,
      width: '900px'
    });
    return addressDialogRef.afterClosed().switchMap(
      (res: Address) => {
        if (res !== prepopulated) {
          return Observable.of(res);
        } else {
          return Observable.of(null);
        }
      }
    );
  }

  editText(title: string, msg: string, prepopulated?: string) {
    const textDialogRef = this.dialog.open(EditTextComponent, {
      data: {
        title: title,
        message: msg,
        prepopulated: prepopulated
      },
      hasBackdrop: true,
      width: '900px'
    });
    return textDialogRef.afterClosed().switchMap(
      (res: string) => {
        if (res !== prepopulated) {
          return Observable.of(res);
        } else {
          return Observable.of(null);
        }
      }
    );
  }

}
