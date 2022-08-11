import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {SchoolService} from '@admin/modules/school/school.service';
import {EditableService} from '@shared/editable/editable.service';
import {emailValidator} from '../../../../../../validators';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes/Alert';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {

  schools: any[] = [];
  form: UntypedFormGroup;
  schoolSub: Subscription;
  students: any[] = [];
  page = 1;
  limit = 10;
  total = 0;
  showAdd = false;

  addForm: UntypedFormGroup;

  constructor(private route: ActivatedRoute,
              private fb: UntypedFormBuilder, private schoolSvc: SchoolService,
              private changeDet: ChangeDetectorRef, private editableSvc: EditableService,
              private store: Store<any>) {
  }

  ngOnInit() {
    this.schools = this.route.snapshot.data.schools;
    this.form = this.fb.group({
      school: ''
    });
    this.addForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', emailValidator],
      graduationDate: [<Date>null, Validators.required],
      school: ['', Validators.required]
    });
    this.schoolSub = this.form.controls.school.valueChanges.subscribe(
      () => {
        this.page = 1;
        this.getStudents();
      }
    );
    this.getStudents();
  }

  ngOnDestroy() {
    if (this.schoolSub) {
      this.schoolSub.unsubscribe();
    }
  }

  getStudents() {
    this.schoolSvc.getStudents(this.page, this.limit, this.form.controls.school.value).subscribe(
      (res: any) => {
        this.students = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getStudents();
  }

  addStudent() {
    if (this.addForm.valid) {
      this.schoolSvc.addStudent({
        firstName: this.addForm.controls.firstName.value,
        lastName: this.addForm.controls.lastName.value,
        email: this.addForm.controls.email.value,
        school: this.addForm.controls.school.value,
        graduationDate: this.addForm.controls.graduationDate.value
      }).subscribe(
        (student: any) => {
          this.store.dispatch(new AddAlert({
            type: AlertTypes.SUCCESS,
            title: 'Student Added',
            message: `${student.firstName} ${student.lastName} has been added.`
          }));
          this.showAdd = false;
          this.addForm.reset();
          this.getStudents();
        }
      );
    }
  }

  updateEmail(record): void {
    if (record.redeemed || record.isExpired) {
      return;
    }
    this.editableSvc.editEmail('Edit Email', `Provide an updated email address to associate with the student: ${record.name}`, record.email)
      .subscribe(
        (res: any) => {
          if (res) {
            this.schoolSvc.updateStudent(record._id, 'email', res).subscribe(
              () => {
                record.email = res;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  updateGraduationDate(record): void {
    if (record.redeemed || record.isExpired) {
      return;
    }
    this.editableSvc
      .editDate('Edit Graduation', `Provide an updated graduation date to associate with the student:
       ${record.name}`, 'Graduations Date', record.graduationDate)
      .subscribe(
        (res: any) => {
          if (res) {
            this.schoolSvc.updateStudent(record._id, 'graduationDate', res).subscribe(
              () => {
                record.graduationDate = res;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

}
