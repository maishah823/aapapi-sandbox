import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {

  constructor(private adminSvc: AdminService, private fb: UntypedFormBuilder,
              private store: Store<any>, private changeDet: ChangeDetectorRef) {
  }

  form: UntypedFormGroup;


  ngOnInit() {
    this.form = this.fb.group({
      message: ['', [Validators.required]]
    });
  }

  send() {
    if (this.form.valid) {
      this.adminSvc.bulkAttendeeSMS(this.form.get('message').value).subscribe(
        () => {
          this.form.reset();
          this.changeDet.markForCheck();
          this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'SUCCESS', message: 'Your message has been sent.'}));
        }
      );
    }
  }

}
