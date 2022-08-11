import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-coupon-dialog',
  templateUrl: './add-coupon-dialog.component.html',
  styleUrls: ['./add-coupon-dialog.component.scss']
})
export class AddCouponDialogComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;
  typeSub: Subscription;

  constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<AddCouponDialogComponent>) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      type: [null, Validators.required],
      code: [null, Validators.required],
      discount: [null],
      singleUse: [false]
    });

    this.typeSub = this.form.get('type').valueChanges.subscribe(
      (type: string) => {
        if (type === 'member-rate') {
          this.form.get('discount').clearValidators();
        } else {
          this.form.get('discount').setValidators([Validators.required, Validators.pattern(/^[0-9]+\.{0,1}[0-9]{0,2}$/)]);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.typeSub) {
      this.typeSub.unsubscribe();
    }
  }

  makeCode() {
    if (!this.form.valid) {
      return;
    }

    if (this.form.get('type').value == 'member-rate') {
      this.form.get('discount').setValue('0');
    }

    let coupon = {
      type: this.form.get('type').value,
      code: this.form.get('code').value,
      discount: this.form.get('discount').value,
      singleUse: this.form.get('singleUse').value,
    };

    this.dialogRef.close(coupon);
  }


}
