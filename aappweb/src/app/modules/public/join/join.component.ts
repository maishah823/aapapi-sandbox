import {Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl, AbstractControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {emailValidator, abbv, phoneValidator, zipCodeValidator, stateValidator} from '../../../../validators';
import {PublicService} from '@public/services/public.service';
import {Store} from '@ngrx/store';
import {Login} from '@shared/state';
import {Observable} from 'rxjs/Observable';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';
import {Subscription} from 'rxjs/Subscription';
import {TdDialogService} from '@covalent/core/dialogs';


interface EmailGroup extends UntypedFormGroup {
  email: UntypedFormControl;
  password: UntypedFormControl;
  checked: UntypedFormControl;
  found: UntypedFormControl;
  isMember: UntypedFormControl;
  locked: UntypedFormControl;
}

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, OnDestroy {

  @ViewChild('agreementStep') agreementStep;

  prefilledFields = 2;

  inProgress = false;

  states: string[] = abbv;
  schools = [];
  selectedSchool: any;
  filteredOptions: Observable<string[]>;
  // Form sections.
  joinForm: UntypedFormGroup;

  requiredFields: number = 0;
  completedFields: number = 0;
  progress: number = 0;

  maxDate = new Date();
  authenticating: boolean = false;

  //Email
  get emailGroup(): EmailGroup {
    return this.joinForm.get('emailGroup') as EmailGroup;
  }

  get email(): UntypedFormControl {
    return this.emailGroup.get('email') as UntypedFormControl;
  }

  get password(): UntypedFormControl {
    return this.emailGroup.get('password') as UntypedFormControl;
  }

  get checked(): UntypedFormControl {
    return this.emailGroup.get('checked') as UntypedFormControl;
  }

  get found(): UntypedFormControl {
    return this.emailGroup.get('found') as UntypedFormControl;
  }

  get isMember(): UntypedFormControl {
    return this.emailGroup.get('isMember') as UntypedFormControl;
  }

  get locked(): UntypedFormControl {
    return this.emailGroup.get('locked') as UntypedFormControl;
  }

  get token(): UntypedFormControl {
    return this.emailGroup.get('token') as UntypedFormControl;
  }

  //Personal Info
  get infoGroup(): UntypedFormGroup {
    return this.joinForm.get('infoGroup') as UntypedFormGroup;
  }

  get firstName(): UntypedFormControl {
    return this.infoGroup.get('firstName') as UntypedFormControl;
  }

  get lastName(): UntypedFormControl {
    return this.infoGroup.get('lastName') as UntypedFormControl;
  }

  get infoAddressGroup(): UntypedFormGroup {
    return this.infoGroup.get('address') as UntypedFormGroup;
  }

  get international(): UntypedFormControl {
    return this.infoAddressGroup.get('international') as UntypedFormControl;
  }

  get street1(): UntypedFormControl {
    return this.infoAddressGroup.get('street1') as UntypedFormControl;
  }

  get street2(): UntypedFormControl {
    return this.infoAddressGroup.get('street2') as UntypedFormControl;
  }

  get city(): UntypedFormControl {
    return this.infoAddressGroup.get('city') as UntypedFormControl;
  }

  get state(): UntypedFormControl {
    return this.infoAddressGroup.get('state') as UntypedFormControl;
  }

  get zip(): UntypedFormControl {
    return this.infoAddressGroup.get('zip') as UntypedFormControl;
  }

  get country(): UntypedFormControl {
    return this.infoAddressGroup.get('country') as UntypedFormControl;
  }

  get homePhone(): UntypedFormControl {
    return this.infoAddressGroup.get('homePhone') as UntypedFormControl;
  }

  get cellPhone(): UntypedFormControl {
    return this.infoAddressGroup.get('cellPhone') as UntypedFormControl;
  }

  get workPhone(): UntypedFormControl {
    return this.infoAddressGroup.get('workPhone') as UntypedFormControl;
  }

  get fax(): UntypedFormControl {
    return this.infoAddressGroup.get('fax') as UntypedFormControl;
  }

  get citizen(): UntypedFormControl {
    return this.infoGroup.get('citizen') as UntypedFormControl;
  }

  get licenseRequired(): UntypedFormControl {
    return this.infoGroup.get('licenseRequired') as UntypedFormControl;
  }

  get isLicensed(): UntypedFormControl {
    return this.infoGroup.get('isLicensed') as UntypedFormControl;
  }

  get licenseNumber(): UntypedFormControl {
    return this.infoGroup.get('licenseNumber') as UntypedFormControl;
  }

  //Member Class
  get classGroup(): UntypedFormGroup {
    return this.joinForm.get('classGroup') as UntypedFormGroup;
  }

  get memberClass(): UntypedFormControl {
    return this.classGroup.get('memberClass') as UntypedFormControl;
  }

  //Training
  get trainingGroup(): UntypedFormGroup {
    return this.joinForm.get('trainingGroup') as UntypedFormGroup;
  }

  get school(): UntypedFormControl {
    return this.trainingGroup.get('school') as UntypedFormControl;
  }

  get schoolName(): UntypedFormControl {
    return this.trainingGroup.get('schoolName') as UntypedFormControl;
  }

  get internSup(): UntypedFormControl {
    return this.trainingGroup.get('internSup') as UntypedFormControl;
  }

  get schoolDirector(): UntypedFormControl {
    return this.trainingGroup.get('schoolDirector') as UntypedFormControl;
  }

  get schoolStreet(): UntypedFormControl {
    return this.trainingGroup.get('schoolStreet') as UntypedFormControl;
  }

  get schoolCity(): UntypedFormControl {
    return this.trainingGroup.get('schoolCity') as UntypedFormControl;
  }

  get schoolState(): UntypedFormControl {
    return this.trainingGroup.get('schoolState') as UntypedFormControl;
  }

  get schoolZip(): UntypedFormControl {
    return this.trainingGroup.get('schoolZip') as UntypedFormControl;
  }

  get schoolPhone(): UntypedFormControl {
    return this.trainingGroup.get('schoolPhone') as UntypedFormControl;
  }

  get graduationDate(): UntypedFormControl {
    return this.trainingGroup.get('graduationDate') as UntypedFormControl;
  }

  //Experience
  get experienceGroup(): UntypedFormControl {
    return this.joinForm.get('experienceGroup') as UntypedFormControl;
  }

  get beenDenied(): UntypedFormControl {
    return this.experienceGroup.get('beenDenied') as UntypedFormControl;
  }

  //Employment
  get employmentGroup(): UntypedFormGroup {
    return this.joinForm.get('employmentGroup') as UntypedFormGroup;
  }

  get employmentStatus(): UntypedFormControl {
    return this.employmentGroup.get('employmentStatus') as UntypedFormControl;
  }

  get agencyName(): UntypedFormControl {
    return this.employmentGroup.get('agencyName') as UntypedFormControl;
  }

  get employmentAddress(): UntypedFormGroup {
    return this.employmentGroup.get('address') as UntypedFormGroup;
  }

  get agencyPhone(): UntypedFormControl {
    return this.employmentAddress.get('workPhone') as UntypedFormControl;
  }

  get agencyStreet1(): UntypedFormControl {
    return this.employmentAddress.get('street1') as UntypedFormControl;
  }

  get agencyStreet2(): UntypedFormControl {
    return this.employmentAddress.get('street2') as UntypedFormControl;
  }

  get agencyCity(): UntypedFormControl {
    return this.employmentAddress.get('city') as UntypedFormControl;
  }

  get agencyState(): UntypedFormControl {
    return this.employmentAddress.get('state') as UntypedFormControl;
  }

  get agencyZip(): UntypedFormControl {
    return this.employmentAddress.get('zip') as UntypedFormControl;
  }

  get supervisorName(): UntypedFormControl {
    return this.employmentGroup.get('supervisorName') as UntypedFormControl;
  }

  get supervisorPhone(): UntypedFormControl {
    return this.employmentGroup.get('supervisorPhone') as UntypedFormControl;
  }

  get supervisorEmail(): UntypedFormControl {
    return this.employmentGroup.get('supervisorEmail') as UntypedFormControl;
  }

  get hireDate(): UntypedFormControl {
    return this.employmentGroup.get('hireDate') as UntypedFormControl;
  }

  get seperationDate(): UntypedFormControl {
    return this.employmentGroup.get('seperationDate') as UntypedFormControl;
  }

  get seperationType(): UntypedFormControl {
    return this.employmentGroup.get('seperationType') as UntypedFormControl;
  }

  //Disclosures
  get disclosuresGroup(): UntypedFormGroup {
    return this.joinForm.get('disclosuresGroup') as UntypedFormGroup;
  }

  //References
  get referencesGroup(): UntypedFormGroup {
    return this.joinForm.get('referencesGroup') as UntypedFormGroup;
  }

  get ref1(): UntypedFormGroup {
    return this.referencesGroup.get('ref1') as UntypedFormGroup;
  }

  get ref2(): UntypedFormGroup {
    return this.referencesGroup.get('ref2') as UntypedFormGroup;
  }

  get ref3(): UntypedFormGroup {
    return this.referencesGroup.get('ref3') as UntypedFormGroup;
  }

  //Payments
  get paymentGroup(): UntypedFormGroup {
    return this.joinForm.get('paymentGroup') as UntypedFormGroup;
  }

  get hasSchoolDiscount(): UntypedFormControl {
    return this.paymentGroup.get('hasSchoolDiscount') as UntypedFormControl;
  }

  get paymentType(): UntypedFormControl {
    return this.paymentGroup.get('paymentType') as UntypedFormControl;
  }

  get cc(): UntypedFormControl {
    return this.paymentGroup.get('cc') as UntypedFormControl;
  }

  get expMonth(): UntypedFormControl {
    return this.paymentGroup.get('expMonth') as UntypedFormControl;
  }

  get expYear(): UntypedFormControl {
    return this.paymentGroup.get('expYear') as UntypedFormControl;
  }

  get cvv(): UntypedFormControl {
    return this.paymentGroup.get('cvv') as UntypedFormControl;
  }

  //Agreement
  get agreementGroup(): UntypedFormGroup {
    return this.joinForm.get('agreementGroup') as UntypedFormGroup;
  }

  //Subscriptions
  stateSub: Subscription;
  isLicensedSub: Subscription;
  schoolSub: Subscription;
  employmentSub: Subscription;
  internationalSub: Subscription;
  formSub: Subscription;
  paymentSub: Subscription;

  constructor(private router: Router, private fb: UntypedFormBuilder,
              private publicSvc: PublicService, private changeDet: ChangeDetectorRef,
              private store: Store<any>, private tdDialog: TdDialogService, private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.schools = this.route.snapshot.data.schools;

    this.joinForm = this.fb.group({
      emailGroup: this.fb.group({
        email: ['', emailValidator],
        lockedInEmail: {value: '', disabled: true},
        checked: [false, Validators.requiredTrue],
        found: false,
        isMember: false,
        locked: false,
        token: ''
      }),
      infoGroup: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        address: this.fb.group({
          international: false,
          street1: ['', Validators.required],
          street2: [''],
          city: ['', Validators.required],
          state: ['', Validators.compose([stateValidator, Validators.required])],
          zip: ['', Validators.compose([zipCodeValidator, Validators.required])],
          country: ['United States', Validators.required],
          workPhone: ['', Validators.compose([phoneValidator, Validators.required])],
          cellPhone: ['', Validators.compose([phoneValidator, Validators.required])],
          homePhone: ['', phoneValidator],
          fax: ['', phoneValidator],
        }),
        citizen: true,
        licenseRequired: false,
        isLicensed: false,
        licenseNumber: '',
        licenseList: ''
      }),
      trainingGroup: this.fb.group({
        school: ['', Validators.required],
        schoolName: '',
        internSup: '',
        schoolDirector: '',
        schoolStreet: '',
        schoolCity: '',
        schoolState: '',
        schoolZip: '',
        schoolPhone: '',
        graduationDate: [<Date>null, Validators.required]

      }),
      classGroup: this.fb.group({
        memberClass: [null, Validators.required],
      }),

      experienceGroup: this.fb.group({
        yearsExperience: [null, [Validators.min(0), Validators.max(80), Validators.required]],
        examsConducted: [null, [Validators.min(0), Validators.max(10000), Validators.required]],
        techniques: '',
        otherOrgs: '',
        beenDenied: false,
        denialExplaination: ''
      }),

      employmentGroup: this.fb.group({
        employmentStatus: [<string>null, Validators.required],
        address: this.fb.group({
          international: false,
          workPhone: ['', [phoneValidator, Validators.required]],
          street1: ['', Validators.required],
          street2: '',
          city: ['', Validators.required],
          state: ['', stateValidator],
          zip: ['', zipCodeValidator],
          country: ['United States', Validators.required]
        }),
        agencyName: ['', Validators.required],
        supervisorEmail: '',
        supervisorName: '',
        supervisorPhone: ['', phoneValidator],
        hireDate: [<Date>null, Validators.required],
        seperationDate: <Date>null,
        seperationType: ''
      }),

      disclosuresGroup: this.fb.group({
        convicted: [null, Validators.required],
        dischargedGov: [null, Validators.required],
        dischargedOrg: [null, Validators.required]
      }),
      referencesGroup: this.fb.group({
        ref1: this.fb.group({
          name: ['', Validators.required],
          agency: ['', Validators.required],
          email: ['', [emailValidator, Validators.required]],
          phone: ['', [phoneValidator, Validators.required]]
        }),
        ref2: this.fb.group({
          name: ['', Validators.required],
          agency: ['', Validators.required],
          email: ['', [emailValidator, Validators.required]],
          phone: ['', [phoneValidator, Validators.required]]
        }),
        ref3: this.fb.group({
          name: ['', Validators.required],
          agency: ['', Validators.required],
          email: ['', [emailValidator, Validators.required]],
          phone: ['', [phoneValidator, Validators.required]]
        })
      }),
      paymentGroup: this.fb.group({
        hasSchoolDiscount: false,
        paymentType: [null, Validators.required],
        cc: [null, [Validators.pattern(/[0-9]{16,16}/), Validators.required]],
        expMonth: [null, [Validators.pattern(/[0-9]{1,2}/), Validators.min(1), Validators.max(12), Validators.required]],
        expYear: [null, [Validators.pattern(/[0-9]{2,2}/), Validators.min(18), Validators.max(99), Validators.required]],
        cvv: [null, [Validators.pattern(/[0-9]{3,4}/), Validators.min(0), Validators.max(9999), Validators.required]],
      }),
      agreementGroup: this.fb.group({})
    });

    this.filteredOptions = this.state.valueChanges
      .startWith('')
      .map(val => this.filter(val));

    this.stateSub = this.state.valueChanges.subscribe(
      val => {
        //DETERMINE IF LICENSE IS REQUIRED
        if (this.state.valid) {
          this.licenseRequired.setValue(true);
        } else {
          this.licenseRequired.setValue(false);
          this.isLicensed.setValue(false);
        }
      }
    );

    this.isLicensedSub = this.isLicensed.valueChanges.subscribe(
      val => {
        if (val) {
          this.licenseNumber.setValidators([Validators.required]);
          this.licenseNumber.markAsTouched();
          this.licenseNumber.updateValueAndValidity();
        } else {

          this.licenseNumber.clearValidators();
          this.licenseNumber.updateValueAndValidity();
        }
      }
    );

    this.schoolSub = this.school.valueChanges.subscribe(
      (val: string) => {
        if (val) {
          if (val == 'other') {
            this.schoolName.setValidators([Validators.required]);
            this.internSup.setValidators([Validators.required]);
            this.schoolDirector.setValidators([Validators.required]);
            this.schoolStreet.setValidators([Validators.required]);
            this.schoolCity.setValidators([Validators.required]);
            this.schoolState.setValidators([stateValidator, Validators.required]);
            this.schoolZip.setValidators([zipCodeValidator, Validators.required]);
            this.schoolPhone.setValidators([phoneValidator, Validators.required]);
            this.schoolName.updateValueAndValidity();
            this.internSup.updateValueAndValidity();
            this.schoolDirector.updateValueAndValidity();
            this.schoolStreet.updateValueAndValidity();
            this.schoolCity.updateValueAndValidity();
            this.schoolState.updateValueAndValidity();
            this.schoolZip.updateValueAndValidity();
            this.schoolPhone.updateValueAndValidity();
          } else {
            this.schoolName.clearValidators();
            this.internSup.clearValidators();
            this.schoolDirector.clearValidators();
            this.schoolStreet.clearValidators();
            this.schoolCity.clearValidators();
            this.schoolState.clearValidators();
            this.schoolZip.clearValidators();
            this.schoolPhone.clearValidators();
            this.schoolName.updateValueAndValidity();
            this.internSup.updateValueAndValidity();
            this.schoolDirector.updateValueAndValidity();
            this.schoolStreet.updateValueAndValidity();
            this.schoolCity.updateValueAndValidity();
            this.schoolState.updateValueAndValidity();
            this.schoolZip.updateValueAndValidity();
            this.schoolPhone.updateValueAndValidity();
          }

          this.selectedSchool = this.schools.find(i => i._id === val);
          return;
        }
        this.selectedSchool = null;
      }
    );

    this.employmentSub = this.employmentStatus.valueChanges.subscribe(
      (val: string) => {
        if (val === 'current' || val == 'former') {
          this.supervisorName.setValidators([Validators.required]);
          this.supervisorPhone.setValidators([Validators.required, phoneValidator]);
          this.supervisorEmail.setValidators([Validators.required, emailValidator]);
        } else {
          this.supervisorName.clearValidators();
          this.supervisorPhone.clearValidators();
          this.supervisorEmail.clearValidators();
        }

        if (val == 'former') {
          this.seperationDate.setValidators([Validators.required]);
          this.seperationType.setValidators([Validators.required]);
        } else {
          this.seperationDate.clearValidators();
          this.seperationType.clearValidators();
        }

        this.supervisorName.updateValueAndValidity();
        this.supervisorPhone.updateValueAndValidity();
        this.supervisorEmail.updateValueAndValidity();
        this.seperationDate.updateValueAndValidity();
        this.seperationType.updateValueAndValidity();
      }
    );

    this.internationalSub = this.international.valueChanges.subscribe(
      val => {

        if (val) {
          this.citizen.setValue(false);
          this.memberClass.setValue('affiliate');
        } else {
          this.citizen.setValue(true);
          this.memberClass.setValue(null);
        }

      }
    );

    this.paymentSub = this.paymentType.valueChanges.subscribe(
      val => {
        if (val == 'credit') {
          this.cc.setValidators([Validators.pattern(/[0-9]{15,16}/), Validators.required]);
          this.expMonth.setValidators([Validators.pattern(/[0-9]{1,2}/), Validators.min(1), Validators.max(12), Validators.required]);
          this.expYear.setValidators([Validators.pattern(/[0-9]{2,2}/), Validators.min(18), Validators.max(99), Validators.required]);
          this.cvv.setValidators([Validators.pattern(/[0-9]{3,4}/), Validators.min(0), Validators.max(9999), Validators.required]);
        } else {
          this.cc.clearValidators();
          this.expMonth.clearValidators();
          this.expYear.clearValidators();
          this.cvv.clearValidators();
        }
        this.cc.updateValueAndValidity();
        this.expMonth.updateValueAndValidity();
        this.expYear.updateValueAndValidity();
        this.cvv.updateValueAndValidity();
      }
    );

    this.formSub = this.joinForm.statusChanges.subscribe(
      () => {
        this.calculateProgress();
        this.progress = ((this.completedFields - this.prefilledFields) / (this.requiredFields - this.prefilledFields)) * 100;
        //console.log("REQUIRED:", this.requiredFields, "COMPLETED:", this.completedFields);
      }
    );

  }

  ngAfterViewInit() {
    if (this.joinForm.valid) {
      this.agreementStep.active = true;
    }
  }

  calculateProgress() {
    this.requiredFields = 0;
    this.completedFields = 0;
    Object.keys(this.joinForm.controls).forEach(key => {
      this.hasRequiredField(this.joinForm.controls[key]);
    });
  }

  hasRequiredField(abstractControl: AbstractControl) {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        this.requiredFields++;
        if (abstractControl.valid) {
          this.completedFields++;
        }
      } else if (abstractControl.invalid) {
        this.requiredFields++;
      }
    }
    if (abstractControl['controls']) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          this.hasRequiredField(abstractControl['controls'][controlName]);
        }
      }
    }
  }


  ngOnDestroy() {
    if (this.stateSub) {
      this.stateSub.unsubscribe();
    }
    if (this.isLicensedSub) {
      this.isLicensedSub.unsubscribe();
    }
    if (this.schoolSub) {
      this.schoolSub.unsubscribe();
    }
    if (this.employmentSub) {
      this.employmentSub.unsubscribe();
    }

    if (this.internationalSub) {
      this.internationalSub.unsubscribe();
    }

    if (this.formSub) {
      this.formSub.unsubscribe();
    }

    if (this.paymentSub) {
      this.paymentSub.unsubscribe();
    }
  }

  checkEmail() {
    this.publicSvc.checkEmail(this.email.value).subscribe(
      (res: any) => {
        this.checked.setValue(true);
        this.found.setValue(res.found);
        this.isMember.setValue(res.isMember);
        this.changeDet.markForCheck();
        this.hasSchoolDiscount.setValue(res.discount);
        this.school.setValue(res.school);
        this.graduationDate.setValue(res.graduationDate);
      }
    );
  }

  useEmail() {
    this.locked.setValue(true);
  }


  resetEmail() {
    this.emailGroup.reset();
    this.hasSchoolDiscount.setValue(false);
    this.school.setValue(null);
    this.graduationDate.setValue(null);
  }

  help(message) {
    this.tdDialog.openAlert({
      message: message,
      title: 'Hint',
      closeButton: 'Close',
      width: '400px',
    });
  }

  login(password) {
    //If already a member, log in normally, if not a member... populate the form.
    if (this.isMember.value) {
      this.store.dispatch(new Login({email: this.email.value, password: password}));
    } else {
      this.authenticating = true;
      this.publicSvc.authenticateForJoin(this.email.value, password).subscribe(
        (res: any) => {
          this.token.setValue(res.token);
          this.locked.setValue(true);
          this.firstName.setValue(res.firstName);
          this.lastName.setValue(res.lastName);
          this.street1.setValue(res.address.street1);
          this.street2.setValue(res.address.street2);
          this.city.setValue(res.address.city);
          this.state.setValue(res.address.state);
          this.zip.setValue(res.address.zip);
          this.homePhone.setValue(res.address.homePhone);
          this.workPhone.setValue(res.address.workPhone);
          this.cellPhone.setValue(res.address.cellPhone);
          this.fax.setValue(res.address.fax);
        }, () => {
          this.authenticating = false;
        }, () => {
          this.authenticating = false;
          this.changeDet.markForCheck();
        }
      );
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

  determineState(groupName) {
    if (this[groupName].touched && this[groupName].invalid) {
      return 'required';
    }
    if (this[groupName].valid) {
      return 'complete';
    }
    return 'none';
  }

  submitApp() {
    if (!this.joinForm.valid) {
      return;
    }
    this.inProgress = true;
    let completedApp = {
      email: this.email.value,
      token: this.token.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      address: {
        street1: this.street1.value,
        street2: this.street2.value,
        city: this.city.value,
        state: this.state.value,
        zip: this.zip.value,
        country: this.country.value,
        workPhone: this.workPhone.value,
        cellPhone: this.cellPhone.value,
        homePhone: this.homePhone.value,
        fax: this.fax.value
      },
      citizen: this.citizen.value,
      isLicensed: this.isLicensed.value,
      licenseNumber: this.licenseNumber.value,
      licenseList: this.infoGroup.get('licenseList').value,
      school: this.school.value,
      schoolName: this.schoolName.value,
      internSup: this.internSup.value,
      schoolDirector: this.schoolDirector.value,
      schoolStreet: this.schoolStreet.value,
      schoolCity: this.schoolCity.value,
      schoolState: this.schoolState.value,
      schoolZip: this.schoolZip.value,
      schoolPhone: this.schoolPhone.value,
      graduationDate: this.graduationDate.value,
      memberClass: this.memberClass.value,
      yearsExperience: this.experienceGroup.get('yearsExperience').value,
      examsConducted: this.experienceGroup.get('examsConducted').value,
      techniques: this.experienceGroup.get('techniques').value,
      otherOrgs: this.experienceGroup.get('otherOrgs').value,
      beenDenied: this.beenDenied.value,
      denialExplaination: this.experienceGroup.get('denialExplaination').value,
      employmentStatus: this.employmentStatus.value,
      employmentAddress: {
        street1: this.employmentAddress.get('street1').value,
        street2: this.employmentAddress.get('street2').value,
        city: this.employmentAddress.get('city').value,
        state: this.employmentAddress.get('state').value,
        zip: this.employmentAddress.get('zip').value,
        country: this.employmentAddress.get('country').value,
        workPhone: this.employmentAddress.get('workPhone').value,
      },
      employmentAgency: this.agencyName.value,
      supervisorName: this.supervisorName.value,
      supervisorPhone: this.supervisorPhone.value,
      supervisorEmail: this.supervisorEmail.value,
      hireDate: this.hireDate.value,
      seperationDate: this.seperationDate.value,
      seperationType: this.seperationType.value,
      convicted: this.disclosuresGroup.get('convicted').value,
      dischargedGov: this.disclosuresGroup.get('dischargedGov').value,
      dischargedOrg: this.disclosuresGroup.get('dischargedOrg').value,
      ref1: {
        name: this.ref1.get('name').value,
        agency: this.ref1.get('agency').value,
        email: this.ref1.get('email').value,
        phone: this.ref1.get('phone').value
      },
      ref2: {
        name: this.ref2.get('name').value,
        agency: this.ref2.get('agency').value,
        email: this.ref2.get('email').value,
        phone: this.ref2.get('phone').value
      },
      ref3: {
        name: this.ref3.get('name').value,
        agency: this.ref3.get('agency').value,
        email: this.ref3.get('email').value,
        phone: this.ref3.get('phone').value
      },

      hasSchoolDiscount: this.hasSchoolDiscount.value,
      paymentType: this.paymentType.value,
      cc: this.cc.value,
      expMonth: this.expMonth.value,
      expYear: this.expYear.value,
      cvv: this.cvv.value
    };


    this.publicSvc.submitApplication(completedApp).finally(() => {
      this.inProgress = false;
      this.changeDet.markForCheck();
    }).subscribe(
      res => {
        this.joinForm.reset();
        this.store.dispatch(new AddAlert({
          type: AlertTypes.SUCCESS,
          title: 'Success',
          message: 'You have successfully applied. You will receive an email upon final approval.'
        }));
        this.router.navigate(['/web']);
      }
    );

  }

}
