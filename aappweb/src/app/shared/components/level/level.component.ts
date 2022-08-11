import {Component, OnInit, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {

  form: UntypedFormGroup;

  get level(): UntypedFormControl {
    return this.form.get('level') as UntypedFormControl;
  }

  constructor(public dialogRef: MatDialogRef<LevelComponent>, private fb: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      level: [this.data.level, Validators.required]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.level.value);
    }
  }

}
