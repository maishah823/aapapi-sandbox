import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-edit-text',
  templateUrl: './edit-text.component.html',
  styleUrls: ['./edit-text.component.scss']
})
export class EditTextComponent implements OnInit {


  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<EditTextComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      text: [this.data.prepopulated, Validators.required]
    });
  }

  change() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.controls.text.value);
    }
  }

}
