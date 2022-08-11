import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import * as moment from 'moment-timezone';
import {ConferenceService} from '@shared/services/conference.service';
import {Subscription} from 'rxjs/Subscription';
import {ScheduleAddService} from './schedule-add.service';
import {arrayNotEmptyValidator} from '../../../../validators';

@Component({
  selector: 'aapp-schedule-add',
  templateUrl: './schedule-add.component.html',
  styleUrls: ['./schedule-add.component.scss']
})
export class ScheduleAddComponent implements OnInit, OnDestroy {

  @Input() prepopulate: any = {instructors: [], topics: []};
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelled: EventEmitter<any> = new EventEmitter<any>();
  @Output() status: EventEmitter<any> = new EventEmitter<any>();

  form: UntypedFormGroup;

  utcOffset = '+0000';
  timezone = 'America/New_York';
  conference: any;

  instructors: any = [];
  topics: any = [];

  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'EEE MMMM dd, yyyy hh:mm a'
  };

  startTimeSub: Subscription;
  endTimeSub: Subscription;
  formSub: Subscription;

  showInstructors = false;
  submitting = false;

  constructor(private fb: UntypedFormBuilder, private confSvc: ConferenceService,
              private changeDet: ChangeDetectorRef, private scheduleAddSvc: ScheduleAddService) {
  }

  ngOnInit() {
    this.prepopulate = this.prepopulate ? this.prepopulate : {instructors: [], topics: []};
    if (this.prepopulate.conference) {
      this.utcOffset = this.prepopulate.conference.utcOffset;
      this.timezone = this.prepopulate.conference.timezone;
      this.conference = this.prepopulate.conference;
      this.setUp();
      this.changeDet.markForCheck();
    } else {
      this.confSvc.nextConference().subscribe(
        (conf: any) => {
          this.utcOffset = conf.utcOffset;
          this.timezone = conf.timezone;
          this.conference = conf;
          this.setUp();
          this.changeDet.markForCheck();
        }
      );
    }

  }

  setUp() {

    this.form = this.fb.group({
      name: [this.prepopulate.name || '', Validators.required],
      startDateTime: this.prepopulate.startDateTime ?
        new Date(moment.tz(this.prepopulate.startDateTime, this.timezone).format('YYYY-MM-DDTHH:mm')) : new Date(),
      endDateTime: this.prepopulate.endDateTime ?
        new Date(moment.tz(this.prepopulate.endDateTime, this.timezone).format('YYYY-MM-DDTHH:mm')) : moment().add(1, 'hour').toDate(),
      room: [this.prepopulate.room || '', Validators.required],
      description: [this.prepopulate.description || '', Validators.required],
      instructors: [[], arrayNotEmptyValidator],
      topics: [this.prepopulate.topics ? this.prepopulate.topics : [], arrayNotEmptyValidator],
    });
    setTimeout(() => {
      this.form.get('topics').setValue(this.prepopulate.topics);
      this.showInstructors = true;
      this.form.get('room').markAsTouched();
      this.form.get('room').updateValueAndValidity();
      this.form.get('description').markAsTouched();
      this.form.get('description').updateValueAndValidity();

    }, 2000);

    this.scheduleAddSvc.instructorsDropdown().subscribe(
      (instructors: any) => {
        this.instructors = instructors || [];
        this.changeDet.markForCheck();
      }
    );
    this.scheduleAddSvc.getTopics().subscribe(
      (topics: any) => {
        this.topics = topics || [];
        this.changeDet.markForCheck();
      }
    );

    this.startTimeSub = this.form.get('startDateTime').valueChanges.subscribe(() => {
      this.form.get('endDateTime').setValue(moment(new Date(this.form.get('startDateTime').value)).add(1, 'hour').toDate());
    });
    this.endTimeSub = this.form.get('endDateTime').valueChanges.subscribe(() => {
      if (new Date(this.form.get('endDateTime').value) < new Date(this.form.get('startDateTime').value)) {
        this.form.get('endDateTime').setValue(moment(new Date(this.form.get('startDateTime').value)).add(1, 'hour').toDate());
      }
    });
    this.formSub = this.form.statusChanges.subscribe((status) => {
    });
  }


  ngOnDestroy() {
    if (this.startTimeSub) {
      this.startTimeSub.unsubscribe();
    }
    if (this.endTimeSub) {
      this.endTimeSub.unsubscribe();
    }
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  save() {
    if (this.form.valid) {
      this.submitting = true;
      const eventToSave = {
        _id: this.prepopulate._id,
        name: this.form.get('name').value,
        room: this.form.get('room').value,
        description: this.form.get('description').value,
        topics: this.form.get('topics').value,
        instructors: this.form.get('instructors').value,
        startDateTime: moment(new Date(this.form.get('startDateTime').value)).utcOffset(this.utcOffset, true).toDate(),
        endDateTime: moment(new Date(this.form.get('endDateTime').value)).utcOffset(this.utcOffset, true).toDate(),
        conference: this.conference._id,
        utcOffset: this.utcOffset,
        timezone: this.timezone
      };
      this.scheduleAddSvc.saveEvent(eventToSave).finally(() => {
        this.submitting = false;
      }).subscribe(
        () => {
          this.saved.emit({complete: true});
        }
      );

    }
  }

  cancel() {
    this.cancelled.emit();
  }

}
