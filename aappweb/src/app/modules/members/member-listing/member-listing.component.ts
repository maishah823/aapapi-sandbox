import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {MembersService} from '@members/members.service';
import {UntypedFormGroup, UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {SocketService} from '@shared/services';

@Component({
  selector: 'app-member-listing',
  templateUrl: './member-listing.component.html',
  styleUrls: ['./member-listing.component.scss']
})
export class MemberListingComponent implements OnInit, OnDestroy {

  get searchTerm(): UntypedFormControl {
    return this.searchForm.get('search') as UntypedFormControl;
  }

  searchTermSub: Subscription;
  usersChangedSub: Subscription;

  members: any = [];

  page = 1;
  limit = 20;
  total = 0;
  pages = 1;

  searchForm: UntypedFormGroup;

  constructor(private membersSvc: MembersService, private changeDet: ChangeDetectorRef,
              private fb: UntypedFormBuilder, private socket: SocketService) {
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: ''
    });
    this.searchTermSub = this.searchTerm.valueChanges.debounceTime(500).subscribe(
      (val: string) => {
        this.page = 1;
        this.getMembers();
      }
    );
    this.usersChangedSub = this.socket.usersChanged.subscribe(
      () => {
        this.getMembers();
      }
    );

    this.getMembers();
  }

  ngOnDestroy() {
    if (this.searchTermSub) {
      this.searchTermSub.unsubscribe();
    }
    if (this.usersChangedSub) {
      this.usersChangedSub.unsubscribe();
    }
  }

  getMembers() {
    this.membersSvc.memberListing(this.page, this.limit, this.searchTerm.value).subscribe(
      (res: any) => {
        this.members = res.docs;
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
    this.getMembers();
  }

  memberClicked() {

  }

}
