import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-adjust',
  templateUrl: './adjust.component.html',
  styleUrls: ['./adjust.component.scss']
})
export class AdjustComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<AdjustComponent>,
              private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      type: ['', Validators.required],
      amount: [0, Validators.min(0.01)],
      lineNote: ['', Validators.required]
    });
  }

  submit() {
    if (!this.form.valid) {
      return;
    }
    let adjustInfo = {
      type: this.form.get('type').value,
      amount: this.form.get('amount').value,
      lineNote: this.form.get('lineNote').value,
    };

    this.dialogRef.close(adjustInfo);

  }

}
