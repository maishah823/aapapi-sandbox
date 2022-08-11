import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {startRatingValidator} from '../../../../validators';
import {Subscription} from 'rxjs/Subscription';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AddAlert, Checkout} from '@shared/state';
import {Alert, AlertTypes, User} from '@shared/classes';
import {SaveFileService} from 'app/main/save-file.service';
import {TdDialogService} from '@covalent/core/dialogs';


@Component({
  selector: 'app-bluesheet',
  templateUrl: './bluesheet.component.html',
  styleUrls: ['./bluesheet.component.scss']
})
export class BluesheetComponent implements OnInit, OnDestroy {

  courses = [];
  form: UntypedFormGroup;
  subscriptions: Subscription[] = [];
  inProgress = false;
  fetching = false;

  user: User = {firstName: '', lastName: '', email: '', fullname: ''};

  public get coursesFormArray(): UntypedFormArray {
    return this.form.get('courses') as UntypedFormArray;
  }

  get coursesControls(): Array<UntypedFormControl> {
    return this.coursesFormArray.controls as Array<UntypedFormControl>;
  }

  constructor(private files: SaveFileService, private router: Router,
              private store: Store<any>, private confSvc: ConfServiceService,
              private fb: UntypedFormBuilder, private changeDet: ChangeDetectorRef, private dialog: TdDialogService) {
  }

  ngOnInit() {

    this.form = this.fb.group({
      courses: this.fb.array([]),
      organization: [0, [startRatingValidator]],
      relevance: [0, [startRatingValidator]],
      issues: [0, [startRatingValidator]],
      hotel: [0, [startRatingValidator]],
      location: [0, [startRatingValidator]],
      comments: ''

    });
    this.store.select('user').take(1).subscribe(user => {
      this.user = user;
    });
    this.getCourses();
  }

  ngOnDestroy() {
    for (let s = 0; s < this.subscriptions.length; s++) {
      this.subscriptions[s].unsubscribe();
    }
  }

  setUpForm() {

    for (let i = 0; i < this.courses.length; i++) {
      let c = this.courses[i];

      let savedScore = localStorage.getItem(c._id + '-score');
      let savedHours = localStorage.getItem(c._id + '-hours');
      let comment = localStorage.getItem(c._id + '-comment');
      let newGroup = this.fb.group({
        id: c._id,
        name: c.name,
        instructors: c.instructors ? this.fb.array(c.instructors.map(inst => inst.fullname)) : [],
        date: c.displayDate + ' ' + c.displayStartTime,
        type: c.type,
        duration: c.duration,
        hoursAttended: [parseFloat(savedHours) || 0, [Validators.min(0), Validators.max(parseFloat(c.duration))]],
        score: parseInt(savedScore) || 0,
        comment: comment
      });

      // Create subscription
      this.subscriptions.push(newGroup.get('hoursAttended').valueChanges.subscribe(
        val => {

          val = parseFloat(val);
          if (val > 0) {
            newGroup.get('score').setValidators([startRatingValidator]);
            localStorage.setItem(newGroup.get('id').value + '-hours', val);
          } else {
            newGroup.get('score').clearValidators();
          }
          newGroup.get('score').updateValueAndValidity();
          this.changeDet.markForCheck();
        }
      ));
      this.subscriptions.push(newGroup.get('score').valueChanges.subscribe(
        val => {

          val = parseInt(val);
          if (val > 0) {
            localStorage.setItem(newGroup.get('id').value + '-score', val);
          }
        }
      ));
      this.subscriptions.push(newGroup.get('comment').valueChanges.subscribe(
        val => {
          localStorage.setItem(newGroup.get('id').value + '-comment', val);
        }
      ));
      this.coursesFormArray.push(newGroup);
    }


  }

  getCourses() {
    this.fetching = true;
    this.changeDet.markForCheck();
    this.confSvc.classesForCheckout().finally(() => {
      this.fetching = false;
      this.changeDet.markForCheck();
    }).subscribe(
      (res: any) => {
        this.courses = res || [];
        this.setUpForm();
      }
    );
  }

  calculateTotal() {
    let total = 0;
    this.form.get('courses').value.forEach((val) => total = total + parseFloat(val.hoursAttended));
    return total;
  }

  submit() {
    if (!this.form.valid) {
      return;
    }
    let totalHours = 0;
    for (let c = 0; c < this.coursesFormArray.value.length; c++) {
      totalHours = totalHours + this.coursesFormArray.value[c].hoursAttended;
    }

    if (totalHours < 1) {
      this.dialog.openAlert({title: 'Incomplete', message: 'You cannot submit a bluesheet with no classroom hours.'});
      return;
    }
    this.dialog.openConfirm({
      message: 'If you continue you will checkout of the seminar and can NO LONGER RECEIVE CREDIT for any further classroom events. Are you sure you want to do this?',
      disableClose: true, // defaults to false

      title: 'Confirm Checkout',
      cancelButton: 'No, not yet.',
      acceptButton: 'Yes!',

    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        this.inProgress = true;
        this.changeDet.markForCheck();
        this.confSvc.submitBluesheet({
          courses: this.coursesFormArray.value.filter(course => course.hoursAttended > 0),
          organization: this.form.get('organization').value,
          relevance: this.form.get('relevance').value,
          issues: this.form.get('issues').value,
          hotel: this.form.get('hotel').value,
          location: this.form.get('location').value,
          comments: this.form.get('comments').value
        }).finally(() => {
          this.inProgress = false;
        }).subscribe(
          (res: Blob) => {
            if (res.size > 0) {
              this.files.saveOrView(res, `AAPP_Certificate_${this.user.firstName}_${this.user.lastName}_${(new Date()).getFullYear()}`, 'application/pdf');
              this.inProgress = false;
            }
            this.store.dispatch(new Checkout());
            this.store.dispatch(new AddAlert({
              type: AlertTypes.SUCCESS,
              title: 'Checkout',
              message: 'Successfully checked out. Your certificate has been downloaded and emailed to you.'
            } as Alert));
            for (let i = 0; i < this.courses.length; i++) {
              let c = this.courses[i];
              localStorage.removeItem(c._id + '-score');
              localStorage.removeItem(c._id + '-hours');
              localStorage.removeItem(c._id + '-comment');
            }
            this.router.navigate(['/web/conf']);
          }
        );
      } else {
        // DO SOMETHING ELSE
      }
    });
  }

  clearAll() {
    this.dialog.openConfirm({
      message: 'Are you sure you want to clear? You will lose all saved hours, comments and ratings.',
      disableClose: true, // defaults to false

      title: 'Clear Data',
      cancelButton: 'Cancel.',
      acceptButton: 'Clear Now!',

    }).afterClosed().subscribe((accept: boolean) => {
      if (!accept) {
        return;
      }
      for (let i = 0; i < this.courses.length; i++) {
        let c = this.courses[i];
        localStorage.removeItem(c._id + '-score');
        localStorage.removeItem(c._id + '-hours');
        localStorage.removeItem(c._id + '-comment');
      }
      this.router.navigate(['/web/conf']);
    });
  }

}
