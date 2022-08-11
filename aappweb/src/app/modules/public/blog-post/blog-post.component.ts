import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PublicService} from '@public/services/public.service';
import {environment} from '../../../../environments/environment';
import {Store} from '@ngrx/store';
import {User} from '@shared/classes';
import {Location} from '@angular/common';
import {Title, DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {

  id: string;
  type: string;
  post: any;
  imagePath = environment.BLOG_IMAGES;
  isAdmin = false;

  constructor(public sanitizer: DomSanitizer, private location: Location,
              private route: ActivatedRoute, private publicSvc: PublicService,
              private changeDet: ChangeDetectorRef, private store: Store<any>, private title: Title) {
  }

  ngOnInit() {

    this.store.select('user').take(1).subscribe(
      (user: User) => {
        if (user.isAdmin) {
          this.isAdmin = true;
        }
      }
    );

    this.id = this.route.snapshot.params['id'];
    this.type = this.route.snapshot.queryParams['t'] || 'public';
    this.getPost();
  }

  getPost() {
    if (this.type === 'member' || this.type === 'conf') {
      this.publicSvc.getSingleAuthPost(this.id).subscribe(
        (res: any) => {
          this.post = res;
          this.title.setTitle((res.title || 'Blog Article') + ' | AAPP');
          this.changeDet.markForCheck();
        }
      );
      return;
    }
    this.publicSvc.getSinglePost(this.id).subscribe(
      (res: any) => {
        this.post = res;
        this.title.setTitle((res.title || 'Blog Article') + ' | AAPP');
        this.changeDet.markForCheck();
      }
    );
  }

  goBack() {
    this.location.back();
  }
}
