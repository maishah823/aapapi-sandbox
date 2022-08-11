import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-edit-date',
  templateUrl: './edit-date.component.html',
  styleUrls: ['./edit-date.component.scss']
})
export class EditDateComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<EditDateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      date: [this.data.prepopulated, Validators.required]
    });
  }

  change() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.controls.date.value);
    }
  }

}
