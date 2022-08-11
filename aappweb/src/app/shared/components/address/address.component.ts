import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {abbv, phoneValidator, stateValidator, zipCodeValidator} from '../../../../validators';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'aapp-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {

  states = abbv;
  filteredOptions: Observable<string[]>;
  @Input('formGroup') formGroup: UntypedFormGroup;
  intlSub: Subscription;

  constructor() {
  }

  get international(): UntypedFormControl {
    return this.formGroup.get('international') as UntypedFormControl;
  }

  get state(): UntypedFormControl {
    return this.formGroup.get('state') as UntypedFormControl;
  }

  get zip(): UntypedFormControl {
    return this.formGroup.get('zip') as UntypedFormControl;
  }

  get country(): UntypedFormControl {
    return this.formGroup.get('country') as UntypedFormControl;
  }

  get workPhone(): UntypedFormControl {
    return this.formGroup.get('workPhone') as UntypedFormControl;
  }

  get cellPhone(): UntypedFormControl {
    return this.formGroup.get('cellPhone') as UntypedFormControl;
  }

  get homePhone(): UntypedFormControl {
    return this.formGroup.get('homePhone') as UntypedFormControl;
  }

  get fax(): UntypedFormControl {
    return this.formGroup.get('fax') as UntypedFormControl;
  }

  ngOnInit() {
    if (!environment.production) {
      const requiredFields = ['street1', 'street2', 'city', 'state', 'zip', 'country', 'international'];
      requiredFields.forEach(type => {
        if (!this.formGroup.get(type)) {
          throw new Error('Address component needs field:' + type);
        }
      });
    }
    if (!this.formGroup.get('international')) {
      this.formGroup.addControl('international', new UntypedFormControl(false));
    }
    this.filteredOptions = this.formGroup.controls.state.valueChanges
      .pipe(startWith(''))
      .pipe(map(val => this.filter(val)));

    if (this.formGroup.get('international')) {
      this.formGroup.get('international').valueChanges.subscribe(
        val => {
          this.changeInternationalOptions(val);

          this.state.markAsTouched();
          this.zip.markAsTouched();
          this.state.updateValueAndValidity();
          this.zip.updateValueAndValidity();
          this.country.updateValueAndValidity();
        }
      );
    }
    this.changeInternationalOptions(this.international.value);
  }

  changeInternationalOptions(val) {
    if (val) {
      this.state.clearValidators();
      this.zip.clearValidators();
      this.cellPhone.clearValidators();
      this.homePhone.clearValidators();
      this.workPhone.clearValidators();
      this.fax.clearValidators();
      this.state.setValidators([Validators.required]);
      this.zip.setValidators([Validators.required]);
      this.cellPhone.setValidators([Validators.required]);
      this.workPhone.setValidators([Validators.required]);
      if (this.country.value === 'United States') {
        this.country.setValue(null);
        this.country.markAsTouched();
      }


    } else {
      this.state.clearValidators();
      this.zip.clearValidators();
      this.cellPhone.clearValidators();
      this.homePhone.clearValidators();
      this.workPhone.clearValidators();
      this.fax.clearValidators();
      this.state.setValidators([stateValidator, Validators.required]);
      this.zip.setValidators([zipCodeValidator, Validators.required]);
      this.cellPhone.setValidators([phoneValidator, Validators.required]);
      this.workPhone.setValidators([phoneValidator, Validators.required]);
      this.homePhone.setValidators([phoneValidator]);
      this.fax.setValidators([phoneValidator]);

      this.country.setValue('United States');
    }

    this.state.updateValueAndValidity();
    this.zip.updateValueAndValidity();
    this.cellPhone.updateValueAndValidity();
    this.homePhone.updateValueAndValidity();
    this.workPhone.updateValueAndValidity();
    this.fax.updateValueAndValidity();

  }

  ngOnDestroy() {
    if (this.intlSub) {
      this.intlSub.unsubscribe();
    }
  }

  filter(val: string = ''): string[] {
    if (val) {
      return this.states.filter(option =>
        option.toLowerCase().indexOf(val.toLowerCase()) === 0);
    } else {
      return this.states;
    }
  }

}
