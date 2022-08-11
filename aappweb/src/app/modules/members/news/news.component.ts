import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {MembersService} from '@members/members.service';
import {slideInFromBottom} from '@shared/animations';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  animations: [slideInFromBottom]
})
export class NewsComponent implements OnInit {

  blogs: any[] = [];

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  constructor(private memberSvc: MembersService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getPosts();
  }

  getPosts() {
    this.memberSvc.getMemberNews(this.page, this.limit).subscribe(
      (res: any) => {
        this.blogs = res.docs;
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
    this.getPosts();
  }
}
