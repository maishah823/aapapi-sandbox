import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';
import {emailValidator} from '../../../../../validators';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-edit-email',
  templateUrl: './edit-email.component.html',
  styleUrls: ['./edit-email.component.scss']
})
export class EditEmailComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<EditEmailComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: [this.data.prepopulated, emailValidator]
    });
  }

  change() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.controls.email.value);
    }
  }

}
