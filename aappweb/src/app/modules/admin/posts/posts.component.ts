import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  blogs: any[] = [];

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  constructor(private adminSvc: AdminService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getPosts();
  }

  getPosts() {
    this.adminSvc.getBlogs(this.page, this.limit).subscribe(
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
