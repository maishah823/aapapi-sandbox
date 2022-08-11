import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'aapp-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {

  @Input() post;
  @Input() blogType:string = 'public';
  @Input() preview = false;
  imageUrl = environment.BLOG_IMAGES;

  constructor() { }

  ngOnInit() {
  }

  imageError(e){
    e.target.src = "/assets/images/blog-holder-thumb.jpg";
  }


}
