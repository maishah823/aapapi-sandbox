import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {emailValidator, memberNumberValidator} from 'validators';

@Component({
  selector: 'app-manual-member',
  templateUrl: './manual-member.component.html',
  styleUrls: ['./manual-member.component.scss']
})
export class ManualMemberComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(private adminSvc: AdminService, private fb: UntypedFormBuilder, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', emailValidator],
      membernumber: [null, [memberNumberValidator, Validators.min(1), Validators.max(4999)]],
      memberLevel: ['', Validators.required],
      needsInvoice: false
    });
  }


  addMember() {

    let newMemeber: any = {
      firstName: this.form.get('firstName').value,
      lastName: this.form.get('lastName').value,
      email: this.form.get('email').value,
      memberNumber: this.form.get('membernumber').value,
      memberLevel: this.form.get('memberLevel').value,
      needsInvoice: this.form.get('needsInvoice').value

    };
    this.adminSvc.manualMember(newMemeber).subscribe(
      (res) => {
        this.form.reset();
        this.changeDet.markForCheck();
      }
    );
  }

}
