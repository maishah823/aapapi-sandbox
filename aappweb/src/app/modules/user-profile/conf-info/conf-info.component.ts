import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {UserService} from '../services/user.service';
import {UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, UntypedFormControl, Validators} from '@angular/forms';
import {guestValidator} from 'validators';
import {slideInFromBottom} from '@shared/animations';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';

@Component({
  selector: 'app-conf-info',
  templateUrl: './conf-info.component.html',
  styleUrls: ['./conf-info.component.scss'],
  animations: [slideInFromBottom]
})
export class ConfInfoComponent implements OnInit {

  inProgress = false;

  attendeeInfo = {
    conference: {}
  };

  conference: any = {};

  form: UntypedFormGroup;

  get guests(): UntypedFormArray {
    return this.form.get('guests') as UntypedFormArray;
  }

  get guestControls(): Array<UntypedFormControl> {
    return this.guests.controls as Array<UntypedFormControl>;
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

  events: any = [];

  //totals
  guestTotal = 0;

  constructor(private userSvc: UserService, private store: Store<any>, private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
  }


  ngOnInit() {

    this.setUpForm();
    this.getMyInfo();

    this.userSvc.getEvents().subscribe(
      (res: any) => {
        this.events = res.events;
        this.conference = res.conference;
        this.changeDet.markForCheck();
      }
    );
  }

  setUpForm() {
    this.form = this.fb.group({
      guests: this.fb.array([this.fb.group({
        name: ['', Validators.required],
        all: true,
        events: [[]]
      }, [guestValidator])]),
      paymentGroup: this.fb.group({
        paymentType: 'cc',
        cc: [null, [Validators.pattern(/[0-9]{15,16}/), Validators.required]],
        expMonth: [null, [Validators.pattern(/[0-9]{1,2}/), Validators.min(1), Validators.max(12), Validators.required]],
        expYear: [null, [Validators.pattern(/[0-9]{2,2}/), Validators.min(18), Validators.max(99), Validators.required]],
        cvv: [null, [Validators.pattern(/[0-9]{3,4}/), Validators.min(0), Validators.max(9999), Validators.required]],
      }),
    });
  }

  getMyInfo() {
    this.userSvc.getConferenceInfo().subscribe(
      (attendeeInfo: any) => {
        this.attendeeInfo = attendeeInfo;
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


  submit() {
    if (this.form.valid) {
      this.inProgress = true;
      //compile object
      let paymentGroup = this.paymentGroup.value;
      let guests = this.guests.value;

      let guestAddInfo = {paymentGroup, guests, total: this.calculateGuestCost()};
      this.userSvc.addGuest(guestAddInfo).finally(() => {
        this.inProgress = false;
      }).subscribe(
        (res: any) => {
          this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'Success', message: 'You have successfully added a guest.'}));
          this.setUpForm();
          this.getMyInfo();
        },
        (err: any) => {

        }
      );
    }

  }


}
