import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {PublicService} from '@public/services/public.service';

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss']
})
export class CertificationsComponent implements OnInit {

  constructor(private publicSvc: PublicService, private changeDet: ChangeDetectorRef) {
  }

  certlist = [];

  ngOnInit() {
    this.getCertifications();
  }

  getCertifications() {
    this.publicSvc.getCertifications().subscribe(
      (res: any) => {
        this.certlist = res || [];
        this.changeDet.markForCheck();
      }
    );
  }

}
