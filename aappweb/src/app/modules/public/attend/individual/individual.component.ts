import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {slideInFromBottom} from '@shared/animations';
import {UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl, UntypedFormArray} from '@angular/forms';
import {emailValidator, stateValidator, zipCodeValidator, phoneValidator, guestValidator} from '../../../../../validators';
import {AttendService} from '@public/attend/attend.service';
import {Store} from '@ngrx/store';
import {Login, AddAlert} from '@shared/state';
import {Subscription} from 'rxjs/Subscription';
import * as moment from 'moment-timezone';
import {ProgressDialogComponent} from '@public/attend/progress-dialog/progress-dialog.component';

import {Router} from '@angular/router';
import {AlertTypes, Alert} from '@shared/classes';
import {MatDialog} from '@angular/material/dialog';
import {TdDialogService} from '@covalent/core/dialogs';

@Component({
  selector: 'app-individual',
  templateUrl: './individual.component.html',
  styleUrls: ['./individual.component.scss'],
  animations: [slideInFromBottom]
})
export class IndividualComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;
  authenticating: boolean = false;
  inProgress = false;
  clonedEvents: any = [];
  conference: any = {};
  conferenceIsCurrent: boolean = true;
  conferencePrice = {label: 'None Selected', amount: 0};
  discount = 0;
  couponId;

  eventsSub: Subscription;
  paymentSub: Subscription;
  couponSub: Subscription;

  events: any = [];

  //totals
  guestTotal = 0;

  //Email
  get emailGroup(): EmailGroup {
    return this.form.get('emailGroup') as EmailGroup;
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

  get isAttendee(): UntypedFormControl {
    return this.emailGroup.get('isAttendee') as UntypedFormControl;
  }

  get isMember(): UntypedFormControl {
    return this.emailGroup.get('isMember') as UntypedFormControl;
  }

  get lifeMember(): UntypedFormControl {
    return this.emailGroup.get('lifeMember') as UntypedFormControl;
  }

  get locked(): UntypedFormControl {
    return this.emailGroup.get('locked') as UntypedFormControl;
  }

  get token(): UntypedFormControl {
    return this.emailGroup.get('token') as UntypedFormControl;
  }

  //Personal Info
  get infoGroup(): UntypedFormGroup {
    return this.form.get('infoGroup') as UntypedFormGroup;
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

  //Payments
  get paymentGroup(): UntypedFormGroup {
    return this.form.get('paymentGroup') as UntypedFormGroup;
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

  //Guests
  get guests(): UntypedFormArray {
    return this.form.get('guests') as UntypedFormArray;
  }

  get guestControls(): Array<UntypedFormControl> {
    return this.guests.controls as Array<UntypedFormControl>;
  }

  constructor(private fb: UntypedFormBuilder, private attendSvc: AttendService,
              private changeDet: ChangeDetectorRef, private store: Store<any>,
              private matDialog: MatDialog, private tdDialog: TdDialogService, private router: Router) {
  }

  ngOnInit() {

    this.form = this.fb.group({
      emailGroup: this.fb.group({
        email: ['', emailValidator],
        lockedInEmail: {value: '', disabled: true},
        checked: [false, Validators.requiredTrue],
        found: [false],
        isAttendee: [false],
        isMember: [false],
        isPending: [false],
        lifeMember: [false],
        locked: [false],
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
        })
      }),
      paymentGroup: this.fb.group({
        paymentType: [null, Validators.required],
        cc: [null],
        expMonth: [null],
        expYear: [null],
        cvv: [null],
      }),
      events: [<Array<any>>[]],
      guests: this.fb.array([]),
      coupon: ''
    });

    this.attendSvc.getEvents().subscribe(
      (res: any) => {

        this.events = res.events;
        this.conference = res.conference;
        this.calculateConferenceIsCurrent();
        this.calculateCurrentConferencePrice();
        this.changeDet.markForCheck();

        //Check that the previously selected events still exists
        let selections = this.form.get('events').value;
        let newSelections = new Set();
        for (let i = 0; i < selections; i++) {
          this.events.forEach(element => {
            if (element._id == selections[i]) {
              newSelections.add(selections[i]);
            }
          });
        }
        this.form.get('events').setValue(Array.from(newSelections));

      }
    );


    this.eventsSub = this.form.get('events').valueChanges.subscribe(val => {
      if (Array.isArray(val)) {
        this.clonedEvents = [...val];
        this.eventsSub.unsubscribe();
      }
    });

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

    this.couponSub = this.form.get('coupon').valueChanges.debounceTime(600).subscribe(
      val => {
        this.checkCoupon();
        this.changeDet.markForCheck();
      }
    );

    //Restore validators for guests
    this.guestControls.forEach(guestControl => {
      guestControl.setValidators([guestValidator]);
    });


  }

  checkCoupon() {
    this.discount = 0;
    this.couponId = null;
    if (!this.form.get('coupon').value) {
      return;
    }
    this.attendSvc.checkCoupon(this.form.get('coupon').value, 'indv').subscribe(
      (res: any) => {
        if (res.found) {
          this.discount = parseFloat(res.discount);
          this.couponId = res._id;
          if (this.calculateTotal() == 0) {
            this.paymentType.clearValidators();
            this.paymentType.setValue(null);
          } else {
            this.paymentType.setValidators([Validators.required]);
            this.paymentType.setValue(null);
          }
        } else {
          this.paymentType.setValidators([Validators.required]);
          this.paymentType.setValue(null);
        }

        this.changeDet.markForCheck();
      }
    );

  }

  createGuest(): UntypedFormGroup {
    let newGroup = this.fb.group({
      name: ['', Validators.required],
      all: true,
      events: [[]]
    });
    newGroup.setValidators([guestValidator]);
    return newGroup;
  }

  addGuest() {
    this.guests.push(this.createGuest());
    this.calculateGuestCost();
  }

  deleteGuest(i) {

    this.guests.removeAt(i);
    this.calculateGuestCost();

  }

  calculateGuestCost() {
    let controls = this.guests.value;
    let total = 0;
    controls.forEach(control => {

      if (control['all']) {
        total = total + parseFloat(this.conference.guestPrice || 125);
      } else if (Array.isArray(control['events'])) {
        control['events'].forEach(event => {

          total = total + this.getCostOfEventFromId(event);
        });
      }
    });
    this.guestTotal = total;
    return total;
  }

  eventsChanged(e) {
    let option = e.option;
    let currentEvents = this.form.get('events').value;
    if (!Array.isArray(currentEvents)) {
      currentEvents = [];
    }
    switch (option.selected) {
      case true:

        if (currentEvents.indexOf(option.value) < 0) {
          currentEvents.push(option.value);
          this.form.get('events').setValue(currentEvents);
        }
        break;
      default:
        if (currentEvents.indexOf(option.value) > -1) {
          currentEvents.splice(currentEvents.indexOf(option.value), 1);
          this.form.get('events').setValue(currentEvents);
        }
    }
  }

  ngOnDestroy() {
    if (this.eventsSub) {
      this.eventsSub.unsubscribe();
    }
    if (this.paymentSub) {
      this.paymentSub.unsubscribe();
    }
    if (this.couponSub) {
      this.couponSub.unsubscribe();
    }
  }


  resetEmail() {
    this.emailGroup.reset();
  }

  useEmail() {
    this.locked.setValue(true);
  }

  checkEmail() {
    this.attendSvc.checkEmail(this.email.value).subscribe(
      (res: any) => {
        if (res.previouslyProcessed) {
          this.store.dispatch(new AddAlert({
            type: AlertTypes.ERROR,
            title: 'Registration',
            message: 'The email has either been previously registered or is not eligible.'
          } as Alert));
          this.resetEmail();
          return;
        }
        this.checked.setValue(true);
        this.found.setValue(res.found);
        this.isAttendee.setValue(res.isAttendee);
        this.isMember.setValue(res.isMember);
        console.log(res.lifeMember);
        this.lifeMember.setValue(res.lifeMember);
        this.calculateCurrentConferencePrice();
        if (!res.found) {
          this.locked.setValue(true);
        }
        this.changeDet.markForCheck();
      }
    );
  }

  login(password) {
    //If already a member, log in normally, if not a member... populate the form.
    if (this.isAttendee.value) {
      this.store.dispatch(new Login({email: this.email.value, password: password}));
    } else {
      this.authenticating = true;
      this.attendSvc.authenticateForAttend(this.email.value, password).subscribe(
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
          this.fax.setValue(res.fax);
          this.isMember.setValue(res.isMember);
        }, () => {
          this.authenticating = false;
        }, () => {
          this.authenticating = false;
          this.changeDet.markForCheck();
        }
      );
    }
  }

  submit() {
    if (this.form.valid) {
      //compile object
      let infoGroup = this.infoGroup.value;
      let emailGroup = this.emailGroup.value;
      let paymentGroup = this.paymentGroup.value;
      let guests = this.guests.value;
      let events = this.form.get('events').value;
      let progressDialog = this.matDialog.open(ProgressDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {email: emailGroup.email}
      });

      let attendRecord = {
        infoGroup,
        emailGroup,
        paymentGroup,
        guests,
        events,
        total: this.calculateTotal(),
        conferencePrice: this.conferencePrice.amount,
        guestPrice: this.calculateGuestCost(),
        discount: this.discount,
        coupon: this.couponId
      };
      this.attendSvc.process('indv', attendRecord).subscribe(
        (res: any) => {
          this.form.reset();
          this.router.navigate(['/web']);
          this.store.dispatch(new AddAlert({
            type: AlertTypes.SUCCESS,
            title: 'Success',
            message: 'You have successfully registered. Check your email for your receipt.'
          }));
          setTimeout(() => {
            progressDialog.close();
          }, 5000);
        },
        (err: any) => {

        }
      );
    }

  }

  help(message) {
    this.tdDialog.openAlert({
      message: message,
      title: 'Hint',
      closeButton: 'Close',
      width: '400px',
    });
  }

  compare(a, b) {

    if (a == b) {
      return true;
    }
  }

  getCostOfEventFromId(id) {
    let cost = 0;
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i]._id == id) {

        cost = parseFloat(this.events[i].cost);
        break;
      }
    }

    return cost;
  }


  calculateCurrentConferencePrice() {
    if (this.conference) {
      let compareMoment = moment(this.conference.startDateTime).subtract(30, 'days');
      let now = moment();
      if (this.lifeMember.value) {
        this.conferencePrice = {label: 'Life Member', amount: 0};
      } else if (now > compareMoment) {
        if (this.isMember.value) {
          this.conferencePrice = {label: 'Member Rate (late registration)', amount: parseFloat(this.conference.memberPrice)};
        } else {
          this.conferencePrice = {label: 'Non-Member Rate (late registration)', amount: parseFloat(this.conference.nonMemberPrice)};
        }
      } else {

        if (this.isMember.value) {
          this.conferencePrice = {label: 'Member Rate (early registration)', amount: parseFloat(this.conference.memberEarlyPrice)};
        } else {
          this.conferencePrice = {label: 'Non-Member Rate (early registration)', amount: parseFloat(this.conference.nonMemberEarlyPrice)};
        }
      }
    }

  }


  calculateConferenceIsCurrent() {
    if (!this.conference) {
      this.conferenceIsCurrent = false;
      return;
    }
    if (moment(this.conference.endDateTime).subtract(1, 'day') > moment()) {
      this.conferenceIsCurrent = true;
    } else {
      this.conferenceIsCurrent = false;
    }

  }


  calculateTotal() {
    let total = (this.guestTotal + this.conferencePrice.amount) - this.discount;
    if (total < 0) {
      return 0;
    }

    if (total == 0) {
      this.paymentType.setValue('invoice');
      this.changeDet.markForCheck();
    }
    return total;
  }


  showProgress() {

  }


}


interface EmailGroup extends UntypedFormGroup {
  email: UntypedFormControl,
  password: UntypedFormControl,
  checked: UntypedFormControl,
  found: UntypedFormControl,
  isAttendee: UntypedFormControl,
  locked: UntypedFormControl
}
