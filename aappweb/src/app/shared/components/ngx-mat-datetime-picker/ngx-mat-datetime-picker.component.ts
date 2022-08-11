import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import * as moment from 'moment';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'aap-ngx-mat-datetime-picker',
  templateUrl: './ngx-mat-datetime-picker.component.html',
  styleUrls: ['./ngx-mat-datetime-picker.component.scss']
})
export class NgxMatDatetimePickerComponent implements OnInit {
  @ViewChild('picker') picker: any;
  @Input() datePickerControl =  new FormControl(new Date());
  @Input() eventFormGroup: FormGroup;

  public date: moment.Moment;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment;
  public maxDate: moment.Moment;
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  constructor() { }

  ngOnInit(): void {
  }

}
