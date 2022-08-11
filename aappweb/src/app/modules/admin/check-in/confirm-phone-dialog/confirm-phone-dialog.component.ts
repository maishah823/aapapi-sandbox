import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {phoneValidator} from '../../../../../validators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-phone-dialog',
  templateUrl: './confirm-phone-dialog.component.html',
  styleUrls: ['./confirm-phone-dialog.component.scss']
})
export class ConfirmPhoneDialogComponent implements OnInit {

  form: UntypedFormGroup;
  matching: boolean;

  constructor(public dialogRef: MatDialogRef<ConfirmPhoneDialogComponent>,
              private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit() {
    if (!this.data.user.address) {
      this.data.user.address = {};
    }
    this.form = this.fb.group({
      phone: [this.data.user.address.cellPhone, [Validators.required, phoneValidator]],
      textAuth: [true, [Validators.required]]
    });

    if (this.data.user.address.country != 'United States') {
      this.form.get('phone').clearValidators();
      this.form.get('phone').setValidators([Validators.required]);
      this.form.get('phone').updateValueAndValidity();
    }
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close(null);
  }

}
