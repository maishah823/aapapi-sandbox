import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {slideDown, fade} from '@shared/animations';
import {Store} from '@ngrx/store';
import {Login} from '@shared/state';
import {emailValidator, passwordValidator} from '../../../../validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [slideDown, fade]
})
export class LoginComponent implements OnInit {

  @Output() done: EventEmitter<boolean> = new EventEmitter<boolean>();
  form: UntypedFormGroup;

  constructor(private store: Store<any>, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', emailValidator],
      password: ['', Validators.required]
    });
  }

  clickedOutside() {
    this.done.emit(true);
  }

  login() {
    if (this.form.valid) {
      this.store.dispatch(new Login({email: this.form.controls.email.value, password: this.form.controls.password.value}));
      this.done.emit(true);
    }
  }

  close() {
    this.done.emit(true);
  }

}
