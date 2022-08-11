import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {SchoolService} from '../school.service';
import {User} from '@shared/classes';
import {ActivatedRoute} from '@angular/router';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';
import {emailValidator} from '../../../../../../validators';

@Component({
  selector: 'app-administrators',
  templateUrl: './administrators.component.html',
  styleUrls: ['./administrators.component.scss']
})
export class AdministratorsComponent implements OnInit {

  admins: User[] = [];
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  schools: any[];

  addForm: UntypedFormGroup;
  showAdd = false;

  constructor(private schoolSvc: SchoolService,
              private changeDet: ChangeDetectorRef, private route: ActivatedRoute, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.schools = this.route.snapshot.data.schools;
    this.addForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', emailValidator],
      school: ['', Validators.required]
    });
    this.getAdmins();
  }

  getAdmins() {
    this.schoolSvc.getSchoolAdmins().subscribe(
      (res: any) => {
        this.admins = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getAdmins();
  }

  addAdmin() {
    if (!this.addForm.valid) {
      return;
    }
    this.schoolSvc.addSchoolAdmin({
      email: this.addForm.controls.email.value,
      firstName: this.addForm.controls.firstName.value,
      lastName: this.addForm.controls.lastName.value,
      adminForSchool: this.addForm.controls.school.value
    }).subscribe(
      () => {
        this.getAdmins();
        this.addForm.reset();
        this.showAdd = false;
      }
    );
  }

}
