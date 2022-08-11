import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {PublicService} from '@public/services/public.service';
import {emailValidator} from '../../../../validators';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {

  form: UntypedFormGroup;
  complete: Boolean;

  constructor(private fb: UntypedFormBuilder, private publicSvc: PublicService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', emailValidator]
    });
  }

  submit() {
    if (this.form.valid) {
      this.publicSvc.sendResetEmail(this.form.get('email').value).subscribe(
        () => {
          this.form.reset();
          this.complete = true;
          this.changeDet.markForCheck();

        }
      );
    }
  }

}
