import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {slideInFromBottom} from '@shared/animations';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {emailValidator, phoneValidator, stateValidator, zipCodeValidator} from '../../../../../validators';
import {AttendService} from '@public/attend/attend.service';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {Subscription} from 'rxjs/Subscription';
import * as moment from 'moment-timezone';
import {ProgressDialogComponent} from '@public/attend/progress-dialog/progress-dialog.component';
import {Router} from '@angular/router';
import {AlertTypes} from '@shared/classes';
import {TdDialogService} from '@covalent/core/dialogs';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-agency',
  templateUrl: './agency.component.html',
  styleUrls: ['./agency.component.scss'],
  animations: [slideInFromBottom]
})
export class AgencyComponent implements OnInit {


  form: UntypedFormGroup;
  inProgress = false;
  conference: any = {};
  conferenceIsCurrent: boolean = true;

  discount = 0;
  couponId;
  memberOverride = false;

  paymentSub: Subscription;
  emailSubs: Subscription[] = [];
  couponSub: Subscription;

  events: any = [];

  //totals
  participantTotal = 0;


  //Personal Info
  get infoGroup(): UntypedFormGroup {
    return this.form.get('infoGroup') as UntypedFormGroup;
  }

  get email(): UntypedFormControl {
    return this.infoGroup.get('email') as UntypedFormControl;
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
  get participants(): UntypedFormArray {
    return this.form.get('participants') as UntypedFormArray;
  }

  get participantControls(): Array<UntypedFormControl> {
    return this.participants.controls as Array<UntypedFormControl>;
  }

  constructor(private fb: UntypedFormBuilder, private attendSvc: AttendService,
              private changeDet: ChangeDetectorRef, private store: Store<any>,
              private tdDialog: TdDialogService, private matDialog: MatDialog, private router: Router) {
  }

  ngOnInit() {

    this.form = this.fb.group({

      infoGroup: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        agency: ['', Validators.required],
        email: ['', [emailValidator, Validators.required]],
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
          fax: ['', phoneValidator]
        })
      }),
      paymentGroup: this.fb.group({
        paymentType: [null, Validators.required],
        cc: [null, [Validators.pattern(/[0-9]{15,16}/), Validators.required]],
        expMonth: [null, [Validators.pattern(/[0-9]{1,2}/), Validators.min(1), Validators.max(12), Validators.required]],
        expYear: [null, [Validators.pattern(/[0-9]{2,2}/), Validators.min(18), Validators.max(99), Validators.required]],
        cvv: [null, [Validators.pattern(/[0-9]{3,4}/), Validators.min(0), Validators.max(9999), Validators.required]],
      }),
      events: [<Array<any>>[]],
      participants: this.fb.array([]),
      coupon: ''
    });

    this.attendSvc.getConference().subscribe(
      (res: any) => {

        this.conference = res;
        this.calculateConferenceIsCurrent();
        this.changeDet.markForCheck();
      }
    );


    this.paymentSub = this.paymentType.valueChanges.subscribe(
      val => {
        if (val == 'credit') {
          this.cc.setValidators([Validators.pattern(/[0-9]{16,16}/), Validators.required]);
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
    setTimeout(() => {
      this.participants.controls.forEach((group: UntypedFormGroup) => {
        this.createParticipantSubscription(group);
      });
    }, 1000);

    this.couponSub = this.form.get('coupon').valueChanges.debounceTime(600).subscribe(
      val => {
        this.checkCoupon();
        this.changeDet.markForCheck();
      }
    );


  }

  checkCoupon() {
    this.discount = 0;
    this.couponId = null;
    this.memberOverride = false;
    if (!this.form.get('coupon').value || this.form.get('coupon').disabled) {
      return;
    }
    this.attendSvc.checkCoupon(this.form.get('coupon').value, 'agency').subscribe(
      (res: any) => {
        if (res.found) {
          this.discount = parseFloat(res.discount);
          this.couponId = res._id;
          if (res.type == 'member-rate') {
            this.memberOverride = true;

          }
          if (this.calculateTotal().total == 0) {
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
        this.recalculatePrices();
        this.changeDet.markForCheck();
      }
    );

    this.recalculatePrices();

  }

  createParticipant(): UntypedFormGroup {
    let newGroup = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [emailValidator, Validators.required]],
      cost: [0],
      rateDesc: '',
      checked: [false]
    });
    this.createParticipantSubscription(newGroup);
    return newGroup;
  }

  addParticipant() {
    this.participants.push(this.createParticipant());
  }

  deleteParticipant(i) {
    this.participants.removeAt(i);
  }

  createParticipantSubscription(group) {
    let subscription = group.get('email').valueChanges.subscribe(email => {
      //Call service to get price;
      if (email && email.match(/^.+@.+\..{2,5}$/)) {
        this.attendSvc.checkEmail(email).subscribe(
          (res: any) => {
            var price = 0;
            var rateDesc = 'Enter Email';
            if (res.isAttendee || res.attendeePending || res.previouslyProcessed) {
              group.get('email').setValue('');
              group.get('cost').setValue(price);
              group.get('rateDesc').setValue('');
              this.store.dispatch(new AddAlert({
                type: AlertTypes.ERROR,
                title: 'EMAIL ERROR',
                message: 'SORRY, the email you entered is either already registered or is not available for use in the system. CHECK WITH THE NATIONAL OFFICE BEFORE PROCEEDING'
              }));
              return;
            }
            let compareMoment = moment(this.conference.startDateTime).subtract(30, 'days');
            let now = moment();
            if (this.conference) {
              if (now > compareMoment) {
                price = parseFloat(this.conference.nonMemberPrice);
                rateDesc = 'Non-Member Rate';
              } else {
                price = parseFloat(this.conference.nonMemberEarlyPrice);
                rateDesc = 'Non-Member Rate (Early)';
              }
              group.get('checked').setValue(true);
              if (res.found || this.memberOverride) {

                if (now > compareMoment) {
                  if (res.isMember || this.memberOverride) {
                    price = parseFloat(this.conference.memberPrice);
                    rateDesc = 'Member Price';
                  }
                } else {
                  if (res.isMember || this.memberOverride) {
                    price = parseFloat(this.conference.memberEarlyPrice);
                    rateDesc = 'Member Rate (Early)';
                  }
                }

              }
              group.get('cost').setValue(price);
              group.get('rateDesc').setValue(rateDesc);
            }
            this.changeDet.markForCheck();
          });
      }
    });
    this.emailSubs.push(subscription);
  }

  recalculatePrices() {
    // Change ALL to member rates. Cannot be undone.

    this.participantControls.forEach(group => {
      group.get('email').updateValueAndValidity({onlySelf: true, emitEvent: true});
    });
  }

  ngOnDestroy() {

    if (this.paymentSub) {
      this.paymentSub.unsubscribe();
    }
    if (this.couponSub) {
      this.couponSub.unsubscribe();
    }
    this.emailSubs.forEach(emailSub => {

      emailSub.unsubscribe();
    });
  }


  submit() {
    if (this.form.valid) {
      //compile object
      let infoGroup = this.infoGroup.value;
      let paymentGroup = this.paymentGroup.value;
      let progressDialog = this.matDialog.open(ProgressDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {email: infoGroup.email}
      });
      let total = this.calculateTotal().total;
      let attendRecord = {
        participants: this.form.get('participants').value,
        infoGroup,
        paymentGroup,
        total: total,
        conferencePrice: total,
        guestPrice: 0,
        discount: this.discount,
        coupon: this.couponId
      };
      this.attendSvc.process('agency', attendRecord).subscribe(
        (res: any) => {
          this.form.reset();
          this.router.navigate(['/web']);
          setTimeout(() => {
            progressDialog.close();
          }, 5000);
          this.store.dispatch(new AddAlert({
            type: AlertTypes.SUCCESS,
            title: 'Success',
            message: 'You have successfully registered. Check your email for your receipt.'
          }));

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
    var total = 0;
    var numberOfReg = 0;
    this.participantControls.forEach(element => {
      total = total + element.get('cost').value || 0;
      numberOfReg = element.get('cost').value && element.get('cost').value > 0 ? numberOfReg + 1 : numberOfReg;
    });
    total = total - (this.discount || 0);
    if (total < 0) {
      total = 0;
    }
    return {numberOfReg, total};
  }


}

