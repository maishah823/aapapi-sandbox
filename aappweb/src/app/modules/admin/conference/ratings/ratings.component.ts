import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {UntypedFormBuilder, UntypedFormGroup, UntypedFormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {CommentsDialogComponent} from '../comments-dialog/comments-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-ratings',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.scss']
})
export class RatingsComponent implements OnInit, OnDestroy {

  classRatings = [];
  generalRatings = [];
  comments = [];
  searchForm: UntypedFormGroup;

  conferences = [{_id: null, name: 'Current Seminar'}];

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  filterSub: Subscription;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef,
              private fb: UntypedFormBuilder, private dialog: MatDialog, private route: ActivatedRoute) {
  }

  get conf(): UntypedFormControl {
    return this.searchForm.get('conf') as UntypedFormControl;
  }

  ngOnInit() {
    this.conferences = this.route.snapshot.data.conferences || [];
    this.searchForm = this.fb.group({
      filter: 10,
      conf: this.conferences[0]._id || null
    });
    this.filterSub = this.searchForm.get('filter').valueChanges.subscribe(
      (val) => {
        this.getComments();
      }
    );
    this.getRatings();
    this.getComments();

  }

  ngOnDestroy() {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  getRatings() {
    this.adminSvc.getCurrentRatings(this.conf.value).subscribe(
      (res: any) => {
        this.classRatings = res.classRatings;
        this.generalRatings = res.generalRatings;
        this.changeDet.markForCheck();
      }
    );
  }

  getComments() {
    this.adminSvc.getGeneralComments(this.page, this.limit, this.conf.value).subscribe(
      (result: any) => {
        this.comments = result.docs || [];
        this.total = result.total || 0;
        this.limit = result.limit || 10;
        this.page = result.page || 1;
        this.pages = result.pages || 0;
        this.changeDet.markForCheck();
      }
    );
  }

  conferenceChanged() {
    this.page = 1;
    this.getRatings();
    this.getComments();
  }


  showComments(classId, type, comments) {
    if (!comments || comments < 1) {
      return;
    }
    this.dialog.open(CommentsDialogComponent, {data: {classId, type}});

  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getComments();
  }

}
