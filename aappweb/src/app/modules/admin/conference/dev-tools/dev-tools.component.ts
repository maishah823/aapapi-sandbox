import {Component, OnInit} from '@angular/core';
import {AdminService} from '@admin/services/admin.service';
import {TdDialogService} from '@covalent/core/dialogs';

@Component({
  selector: 'app-dev-tools',
  templateUrl: './dev-tools.component.html',
  styleUrls: ['./dev-tools.component.scss']
})
export class DevToolsComponent implements OnInit {

  constructor(private admin: AdminService, private dialog: TdDialogService) {
  }

  ngOnInit() {
  }

  clearRegistrations() {
    this.dialog.openConfirm({
      message: 'This action will clear all registrations. Do you really want to do this?',
      title: 'Are you sure?',
      cancelButton: 'No',
      acceptButton: 'YES',
    }).afterClosed().subscribe((accept: boolean) => {
      if (accept) {
        this.admin.clearAllRegistrations().subscribe(
          () => {
            this.dialog.openAlert({
              message: 'Done',
              title: 'Clear Registrations'
            });
          }
        );
      }
    });

  }

}
