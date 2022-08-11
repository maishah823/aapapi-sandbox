import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SchoolService} from '@admin/modules/school/school.service';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {abbv} from '../../../../../../validators';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'app-schools-admin',
  templateUrl: './schools-admin.component.html',
  styleUrls: ['./schools-admin.component.scss']
})
export class SchoolsAdminComponent implements OnInit, OnDestroy {

  schools = [];
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  addForm: UntypedFormGroup;
  showAdd: Boolean = false;

  searchForm: UntypedFormGroup;
  searchSub: Subscription;

  states: string[] = abbv;
  filteredOptions: Observable<string[]>;

  constructor(private schoolSvc: SchoolService, private fb: UntypedFormBuilder, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['United States', Validators.required],
      director: '',
      internSupervisor: '',
      phone: ['', Validators.required]
    });

    this.searchForm = this.fb.group({
      search: ''
    });

    this.getSchools();

    this.filteredOptions = this.addForm.controls.state.valueChanges
      .startWith('')
      .map(val => this.filter(val));

    this.searchSub = this.searchForm.controls.search.valueChanges.debounceTime(600).subscribe(
      () => {
        this.getSchools();
      }
    );
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
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


  getSchools() {
    this.schoolSvc.getSchools(this.page, this.limit, this.searchForm.controls.search.value).subscribe(
      (res: any) => {
        this.schools = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  addSchool() {
    if (!this.addForm.valid) {
      return;
    }
    this.schoolSvc.addSchool({
      name: this.addForm.controls.name.value,
      address: {
        street: this.addForm.controls.street.value,
        city: this.addForm.controls.city.value,
        state: this.addForm.controls.state.value,
        zip: this.addForm.controls.zip.value,
        country: this.addForm.get('country').value
      },
      director: this.addForm.controls.director.value,
      internSupervisor: this.addForm.controls.internSupervisor.value,
      phone: this.addForm.controls.phone.value,
    }).subscribe(() => {
      this.getSchools();
      this.showAdd = false;
      this.addForm.reset();
    });
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getSchools();
  }

  clearSearch() {
    this.page = 1;
    this.searchForm.reset();
  }

}
