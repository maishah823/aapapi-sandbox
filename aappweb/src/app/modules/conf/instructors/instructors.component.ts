import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {environment} from 'environments/environment';

@Component({
  selector: 'app-instructors',
  templateUrl: './instructors.component.html',
  styleUrls: ['./instructors.component.scss']
})
export class InstructorsComponent implements OnInit {

  instructors = [];
  instructorImagesURL = environment.INSTRUCTOR_IMAGES;

  constructor(private confSvc: ConfServiceService, private changeDet: ChangeDetectorRef) {
  }
  ngOnInit() {
    this.getInstructors();
  }

  getInstructors() {
    this.confSvc.getInstructors().subscribe(
      (res: any) => {
        this.instructors = res;
        this.changeDet.markForCheck();
      }
    );
  }

}
