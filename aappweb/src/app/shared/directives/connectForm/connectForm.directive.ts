import {Directive, Input, OnDestroy, OnInit} from '@angular/core';
import {FormGroupDirective, UntypedFormArray, UntypedFormBuilder, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs/Subscription';
import {UPDATE_FORM} from '@shared/state/forms/forms.actions';
import {guestValidator, emailValidator} from 'validators';

@Directive({
  selector: '[connectForm]'
})
export class ConnectFormDirective implements OnInit, OnDestroy {
  @Input('connectForm') path: string;
  formChangeSub: Subscription;

  constructor(private formGroupDirective: FormGroupDirective,
              private store: Store<any>, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {

    if (!this.path) {
      return;
    }

    this.store.select('forms')
      .take(1)
      .map(data => data[this.path])
      .subscribe(val => {
        this.formGroupDirective.form.patchValue(val);

        //Special Case for Form Guest Form Array
        if (this.path == 'indv' && val['guests']) {

          val['guests'].forEach(element => {

            let guestGroup = this.fb.group(
              {
                name: [element.name, Validators.required],
                all: [element.all],
                events: [[...element.events || []]]

              });

            guestGroup.setValidators([guestValidator]);

            (this.formGroupDirective.form.get('guests') as UntypedFormArray).push(guestGroup);
          });
        }

        //Special Case for Participant Form Array
        if (this.path == 'agency' && val['participants']) {

          val['participants'].forEach(element => {

            let participantGroup = this.fb.group(
              {
                firstName: [element.firstName, Validators.required],
                lastName: [element.lastName, Validators.required],
                email: [element.checked && element.cost > 0 ? element.email : null, [emailValidator, Validators.required]],
                cost: [element.checked ? element.cost : 0],
                checked: [element.checked],
                rateDesc: element.rateDesc
              });

            (this.formGroupDirective.form.get('participants') as UntypedFormArray).push(participantGroup);
          });
        }


      });

    this.formChangeSub = this.formGroupDirective.form.valueChanges
      .subscribe(value => {

        this.store.dispatch({
          type: UPDATE_FORM,
          payload: {
            value,
            path: this.path,
          }
        });
      });
  }

  ngOnDestroy() {
    if (this.formChangeSub) {
      this.formChangeSub.unsubscribe();
    }
  }

}
