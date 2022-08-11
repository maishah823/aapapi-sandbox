import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {passwordValidator} from '../../../../validators';
import {MatDialogRef} from '@angular/material/dialog';
import {Subscription} from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;
  matching: boolean;

  constructor(public dialogRef: MatDialogRef<PasswordChangeComponent>, private fb: UntypedFormBuilder) {
  }

  get password() {
    return this.form.get('password1');
  }

  get confirmPass() {
    return this.form.get('password2');
  }

  passwordSub: Subscription;

  ngOnInit() {
    this.form = this.fb.group({
      password1: ['', [Validators.required, passwordValidator]],
      password2: ['', [Validators.required, passwordValidator]],
    });
    this.passwordSub = this.password.valueChanges.merge(this.confirmPass.valueChanges).subscribe(
      (val) => {
        this.matching = this.password.value === this.confirmPass.value;
      }
    );
  }

  ngOnDestroy() {
    if (this.passwordSub) {
      this.passwordSub.unsubscribe();
    }
  }

  change() {
    if (this.form.valid && (this.password.value === this.confirmPass.value)) {
      this.dialogRef.close(this.password.value);
    }
  }

}
