import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {emailValidator, stateValidator, zipCodeValidator} from '../../../../../../validators';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  paymentForm: UntypedFormGroup;

  get address(): UntypedFormGroup {
    return this.paymentForm.get('address') as UntypedFormGroup;
  }


  constructor(public dialogRef: MatDialogRef<PaymentComponent>, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.paymentForm = this.fb.group({
      agency: '',
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: this.fb.group({
        international: false,
        street1: ['', Validators.required],
        street2: [''],
        city: ['', Validators.required],
        state: ['', Validators.compose([stateValidator, Validators.required])],
        zip: ['', Validators.compose([zipCodeValidator, Validators.required])],
        country: ['United States', Validators.required],
      }),
      email: ['', [emailValidator, Validators.required]],
      transaction: [null, Validators.required]
    });
  }

  submitPayment() {
    if (!this.paymentForm.valid) {
      return;
    }
    let paymentInfo = {
      firstName: this.paymentForm.get('firstName').value,
      lastName: this.paymentForm.get('lastName').value,
      address: {
        street1: this.address.get('street1').value,
        street2: this.address.get('street2').value,
        city: this.address.get('city').value,
        state: this.address.get('state').value,
        zip: this.address.get('zip').value,
        country: this.address.get('country').value,
      },
      email: this.paymentForm.get('email').value,
      transaction: 'Check #' + this.paymentForm.get('transaction').value,
    };

    this.dialogRef.close(paymentInfo);

  }


}
