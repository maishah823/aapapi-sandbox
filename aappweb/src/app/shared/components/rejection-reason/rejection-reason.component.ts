import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-rejection-reason',
  templateUrl: './rejection-reason.component.html',
  styleUrls: ['./rejection-reason.component.scss']
})
export class RejectionReasonComponent implements OnInit {


  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<RejectionReasonComponent>, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      text: ['', Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('text').value);
    }
  }

}
