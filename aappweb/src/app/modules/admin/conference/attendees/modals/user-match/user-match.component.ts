import {Component, OnInit, ChangeDetectorRef, Inject} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {AdminService} from '@admin/services/admin.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-user-match',
  templateUrl: './user-match.component.html',
  styleUrls: ['./user-match.component.scss']
})
export class UserMatchComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(public dialogRef: MatDialogRef<UserMatchComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: UntypedFormBuilder, private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  potentials = [];

  ngOnInit() {
    console.log(this.data);
    this.form = this.fb.group({
      search: this.data.lastName,
      selected: ['', Validators.required]
    });
    this.form.get('search').valueChanges.debounceTime(600).subscribe(
      (lastName: string) => {
        this.search(lastName);
      }
    );
    this.search(this.data.lastName);
  }


  search(lastName) {
    this.adminSvc.searchForDuplicateUsers(lastName).subscribe(
      (potentials: any) => {
        this.potentials = potentials;
        this.changeDet.markForCheck();
      }
    );
  }

  // RETURN {member:memberId}

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('selected').value);
    }
  }

  close() {
    this.dialogRef.close();
  }

}
