import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';

export class CaptionData {
  file: string;
}


@Component({
  selector: 'app-caption',
  templateUrl: './caption.component.html',
  styleUrls: ['./caption.component.scss']
})
export class CaptionComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<CaptionComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CaptionData) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      caption: [null, Validators.required],
      album: ['members', Validators.required]
    });
  }

  submit() {
    if (this.form.get('caption').value) {
      this.dialogRef.close({caption: this.form.get('caption').value, album: this.form.get('album').value});
    }
  }

}
