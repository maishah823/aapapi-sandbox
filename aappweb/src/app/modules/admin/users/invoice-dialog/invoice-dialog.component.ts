import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.scss']
})
export class InvoiceDialogComponent implements OnInit {

  form: UntypedFormGroup;
  matching: boolean;

  constructor(public dialogRef: MatDialogRef<InvoiceDialogComponent>, private fb: UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit() {
    this.form = this.fb.group({
      type: ['conference', [Validators.required]],
      description: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(1), Validators.max(9999)]]
    });
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
