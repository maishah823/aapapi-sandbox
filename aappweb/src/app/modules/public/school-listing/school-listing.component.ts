import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {PublicService} from '@public/services/public.service';

@Component({
  selector: 'app-school-listing',
  templateUrl: './school-listing.component.html',
  styleUrls: ['./school-listing.component.scss']
})
export class SchoolListingComponent implements OnInit {

  schools: any[] = [];

  constructor(private publicSvc: PublicService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getSchools();
  }

  getSchools() {
    this.publicSvc.schools().subscribe(
      (res: any) => {
        this.schools = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
