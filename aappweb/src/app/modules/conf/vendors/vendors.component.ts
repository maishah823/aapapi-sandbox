import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {

  vendors = [];

  constructor(private confSvc: ConfServiceService, private changeDet: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.getVendors();
  }

  getVendors() {
    this.confSvc.getVendors().subscribe(
      (vendors: any) => {
        this.vendors = vendors || [];
        this.changeDet.markForCheck();
      }
    );
  }

  makeSubtitle() {
    if (!Array.isArray(this.vendors) || this.vendors.length < 1) {
      return 'The vendor list is currently being determined.';
    }
    if (this.vendors.length == 1) {
      return `The following vendor will be available:`;
    }
    return `The following ${this.vendors.length} vendors will be available:`;

  }

}
