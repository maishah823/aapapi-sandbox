import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PublicService} from '@public/services/public.service';
import {UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl} from '@angular/forms';
import {emailValidator, passwordValidator} from '../../../../validators';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit, OnDestroy {

  code: string;
  complete: boolean;
  form: UntypedFormGroup;

  matching = false;

  get passA(): UntypedFormControl {
    return this.form.get('passA') as UntypedFormControl;
  }

  get passB(): UntypedFormControl {
    return this.form.get('passB') as UntypedFormControl;
  }

  passwordSub: Subscription;

  constructor(private route: ActivatedRoute, private publicSvc: PublicService, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {

    this.code = this.route.snapshot.params['code'];
    this.form = this.fb.group({
      email: ['', emailValidator],
      passA: ['', passwordValidator],
      passB: ['', Validators.required]
    });

    this.passwordSub = this.passA.valueChanges.merge(this.passB.valueChanges).subscribe(
      (val) => {
        if (this.passA.value == this.passB.value) {
          this.matching = true;
        } else {
          this.matching = false;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.passwordSub) {
      this.passwordSub.unsubscribe();
    }
  }

  submit() {
    if (this.form.valid && this.matching) {
      this.publicSvc.resetPassword(this.form.get('email').value, this.form.get('passA').value, this.code).subscribe(
        () => {
          this.form.reset();
          this.complete = true;
        }
      );
    }
  }

}
