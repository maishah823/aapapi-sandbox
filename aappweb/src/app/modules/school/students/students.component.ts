import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {EducatorService} from '../services/educator.service';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {EditableService} from '@shared/editable/editable.service';
import {AddStudentDialogComponent} from '../add-student-dialog/add-student-dialog.component';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes/Alert';
import {MatDialog} from '@angular/material/dialog';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, OnDestroy {

  constructor(private store: Store<any>, private educatorSvc: EducatorService,
              private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder,
              private editableSvc: EditableService, private dialog: MatDialog) {
  }

  stats: { active: number, expired: number, redeemed: number, percentage: number, total: number } = {
    active: 0,
    expired: 0,
    redeemed: 0,
    total: 0,
    percentage: 0
  };
  students: any[] = [];
  page = 1;
  limit = 10;
  total = 0;

  searchForm: UntypedFormGroup;
  searchSub: Subscription;

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: ''
    });
    this.searchSub = this.searchForm.controls.search.valueChanges.debounceTime(600).subscribe(
      () => {
        this.page = 1;
        this.getStudents();
      }
    );
    this.getStudents();
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  getStudents() {
    this.educatorSvc.students(this.page, this.limit, this.searchForm.controls.search.value).subscribe(
      (res: any) => {
        this.stats = res.stats || {active: 0, expired: 0, redeemed: 0, total: 0, percentage: 0};
        this.students = res.students || [];
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

  clearSearch() {
    this.page = 1;
    this.searchForm.reset();
  }

  updateEmail(record): void {
    if (record.redeemed || record.isExpired) {
      return;
    }
    this.editableSvc.editEmail('Edit Email', `Provide an updated email address to associate with the student: ${record.name}`, record.email)
      .subscribe(
        (res: any) => {
          if (res) {
            this.educatorSvc.updateStudent(record._id, 'email', res).subscribe(
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
    this.editableSvc.editDate('Edit Graduation', `Provide an updated graduation date to associate with the student: ${record.name}`, 'Graduations Date', record.graduationDate)
      .subscribe(
        (res: any) => {
          if (res) {
            this.educatorSvc.updateStudent(record._id, 'graduationDate', res).subscribe(
              () => {
                record.graduationDate = res;
                this.changeDet.markForCheck();
              }
            );
          }
        }
      );
  }

  addStudent() {
    let dialogRef = this.dialog.open(AddStudentDialogComponent);
    dialogRef.afterClosed().subscribe(
      (student: any) => {
        if (!student) {
          return;
        }
        this.educatorSvc.addStudent(student).subscribe(
          (res: any) => {
            this.store.dispatch(new AddAlert({
              type: AlertTypes.SUCCESS,
              title: 'Student Added',
              message: `${res.firstName} ${res.lastName} has been added.`
            }));
            this.getStudents();
          }
        );
      }
    );
  }

}
