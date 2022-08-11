import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {DropdownService} from '@admin/services/dropdown.service';
import {emailValidator} from 'validators';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state/alerts';
import {AlertTypes} from '@shared/classes/Alert';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.scss']
})
export class InstructorsComponent implements OnInit, OnDestroy {

  instructors: any[] = [];
  total = 0;
  limit = 10;
  page = 1;
  pages = 0;

  form: UntypedFormGroup;
  searchSub: Subscription;

  topics: any[] = [];

  addInstructorForm: UntypedFormGroup;
  showAddInstructor = false;


  constructor(private store: Store<any>, private adminSvc: AdminService,
              private fb: UntypedFormBuilder, private changeDet: ChangeDetectorRef,
              private dropdown: DropdownService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      search: ''
    });
    this.addInstructorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', emailValidator]
    });
    this.getTopics();
    this.getInstructors();
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  getTopics() {
    this.dropdown.topics().subscribe(
      (topics: any) => {
        this.topics = topics || [];
      }
    );
  }

  getInstructors() {

    this.adminSvc.getInstructors(this.page, this.limit, this.form.get('search').value).subscribe((result: any) => {
      this.instructors = result.docs || [];
      this.total = result.total || 0;
      this.limit = result.limit || 10;
      this.page = result.page || 1;
      this.pages = result.pages || 0;
      this.changeDet.markForCheck();
    });

    this.searchSub = this.form.get('search').valueChanges.debounceTime(500).subscribe((val) => {

      this.getInstructors();
    });
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getInstructors();
  }

  resetSearch() {
    this.form.reset();
  }

  addInstructor() {
    this.adminSvc.addInstructor({
      firstName: this.addInstructorForm.get('firstName').value,
      lastName: this.addInstructorForm.get('lastName').value,
      email: this.addInstructorForm.get('email').value,
    }).subscribe(
      () => {
        this.getInstructors();
        this.addInstructorForm.reset();
        this.showAddInstructor = false;
        this.store.dispatch(new AddAlert({type: AlertTypes.SUCCESS, title: 'Add Instructor', message: 'Succesfully Added'}));
        this.changeDet.markForCheck();
      }
    );
  }

  toggleShowAddInstructor() {
    this.showAddInstructor = !this.showAddInstructor;
  }

}
