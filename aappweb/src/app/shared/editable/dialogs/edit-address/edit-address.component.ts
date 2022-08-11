import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {stateValidator, zipCodeValidator, phoneValidator} from '../../../../../validators';

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<EditAddressComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    if (!this.data.prepopulated) {
      this.data.prepopulated = {};
    }
    this.form = this.fb.group({
      international: false,
      street1: [this.data['prepopulated']['street1'], Validators.required],
      street2: this.data['prepopulated']['street2'],
      city: [this.data['prepopulated']['city'], Validators.required],
      state: [this.data['prepopulated']['state'], Validators.compose([stateValidator, Validators.required])],
      zip: [this.data['prepopulated']['zip'], Validators.compose([zipCodeValidator, Validators.required])],
      country: [this.data['prepopulated']['country'], Validators.required],
      workPhone: [this.data['prepopulated']['workPhone'], Validators.compose([phoneValidator, Validators.required])],
      cellPhone: [this.data['prepopulated']['cellPhone'], Validators.compose([phoneValidator, Validators.required])],
      homePhone: [this.data['prepopulated']['homePhone'], phoneValidator],
      fax: [this.data['prepopulated']['fax'], phoneValidator],
    });
  }

  change() {
    if (this.form.valid) {
      if (
        this.form.get('street1').value !== this.data['prepopulated']['street1'] ||
        this.form.get('street2').value !== this.data['prepopulated']['street2'] ||
        this.form.get('city').value !== this.data['prepopulated']['city'] ||
        this.form.get('state').value !== this.data['prepopulated']['state'] ||
        this.form.get('zip').value !== this.data['prepopulated']['zip'] ||
        this.form.get('country').value !== this.data['prepopulated']['country'] ||
        this.form.get('workPhone').value !== this.data['prepopulated']['workPhone'] ||
        this.form.get('cellPhone').value !== this.data['prepopulated']['cellPhone'] ||
        this.form.get('homePhone').value !== this.data['prepopulated']['homePhone'] ||
        this.form.get('fax').value !== this.data['prepopulated']['fax']
      ) {
        this.dialogRef.close({
          street1: this.form.get('street1').value,
          street2: this.form.get('street2').value,
          city: this.form.get('city').value,
          state: this.form.get('state').value,
          zip: this.form.get('zip').value,
          country: this.form.get('country').value,
          workPhone: this.form.get('workPhone').value,
          cellPhone: this.form.get('cellPhone').value,
          homePhone: this.form.get('homePhone').value,
          fax: this.form.get('fax').value
        });
      } else {
        this.dialogRef.close();
      }
    }
  }

}
