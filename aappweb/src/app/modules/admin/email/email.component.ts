import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {User, Alert, AlertTypes} from '@shared/classes';
import {abbv, stateValidator} from 'validators';
import {AdminService} from '@admin/services/admin.service';
import {AddAlert} from '@shared/state';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  form: UntypedFormGroup;
  smsForm: UntypedFormGroup;
  groups: any = {};
  title = 'Bulk Email';

  groupSub: Subscription;

  filteredOptions: Observable<string[]>;
  states = abbv;

  constructor(private fb: UntypedFormBuilder, private route: ActivatedRoute, private store: Store<any>, private changeDet: ChangeDetectorRef, private adminSvc: AdminService) {
  }


  ngOnInit() {

    this.form = this.fb.group({
      group: [null, Validators.required],
      state: [null],
      message: ['', Validators.required]
    });
    this.smsForm = this.fb.group({
      message: ['', [Validators.required]]
    });

    if (this.route.snapshot.data.purpose == 'regional') {
      this.title = 'Regional Broadcast';
      this.store.select('user').take(1).subscribe(
        (user: User) => {
          if (user.groups.indexOf('regional-manager') > -1) {
            this.groups = [
              {value: 'region' + user.region, label: 'Members in Region ' + user.region},
              {value: 'state', label: 'Members By State'}
            ];
            if (user.isDeveloper) {
              this.groups.push({value: 'test', label: 'Developer Test'});
            }
            this.form.get('group').setValue('region' + user.region);
          } else {
            this.groups = [];
          }
          this.form.get('group').updateValueAndValidity();
          this.changeDet.markForCheck();
        }
      );
    } else {
      this.groups = [
        {value: 'all', label: 'All Members'},
        {value: 'attendees', label: 'All Seminar Attendees'},
        {value: 'instructors', label: 'All Instructors'},
        {value: 'admin', label: 'All Administrators'},
        {value: 'region1', label: 'Region 1 Members'},
        {value: 'region2', label: 'Region 2 Members'},
        {value: 'region3', label: 'Region 3 Members'},
        {value: 'region4', label: 'Region 4 Members'},
        {value: 'region5', label: 'region 5 Members'},
        {value: 'state', label: 'Members By State'},
        {value: 'outstanding', label: 'Users with Outstanding Invoices'},
        {value: 'paid', label: 'Users with No Outstanding Invoices'}
      ];
    }

    this.groupSub = this.form.get('group').valueChanges.subscribe(
      (group: string) => {
        if (group == 'state') {
          this.form.get('state').setValidators([Validators.required, stateValidator]);
        } else {
          this.form.get('state').clearValidators();
        }
        this.form.get('state').updateValueAndValidity();
        this.changeDet.markForCheck();
      }
    );

    this.filteredOptions = this.form.get('state').valueChanges
      .startWith('')
      .map(val => this.filter(val));
  }

  ngOnDestroy() {
    if (this.groupSub) {
      this.groupSub.unsubscribe();
    }
  }

  send() {
    if (this.form.valid) {
      let obj = {
        group: this.form.get('group').value,
        state: this.form.get('group').value == 'state' ? this.form.get('state').value : null,
        message: this.form.get('message').value
      };


      this.adminSvc.bulkEmail(obj).subscribe(
        (res: any) => {
          this.form.reset();
          this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'EMAIL', message: 'Email sent.'} as Alert));
        }
      );
    }

  }

  sendSMS() {
    if (this.smsForm.valid) {
      this.adminSvc.bulkAdminsSMS(this.smsForm.get('message').value).subscribe(
        () => {
          this.smsForm.reset();
          this.changeDet.markForCheck();
          this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'SUCCESS', message: 'Your message has been sent.'}));
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
}
