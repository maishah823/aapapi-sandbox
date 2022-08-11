import {Component, OnInit} from '@angular/core';
import {SaveFileService} from 'app/main/save-file.service';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-upgrade-membership',
  templateUrl: './upgrade-membership.component.html',
  styleUrls: ['./upgrade-membership.component.scss']
})
export class UpgradeMembershipComponent implements OnInit {

  constructor(private files: SaveFileService, private userSvc: UserService) {
  }

  ngOnInit() {
  }

  download_form() {
    this.userSvc.downloadUpgradeForm().subscribe(
      (res: Blob) => {
        this.files.saveOrView(res, 'APPP_Member_Upgrade.pdf');
      }
    );
  }

}
