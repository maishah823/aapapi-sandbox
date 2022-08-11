import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {AdminService} from '../../services/admin.service';
import {UntypedFormGroup, UntypedFormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {

  topics: any[] = [];
  form: UntypedFormGroup;

  constructor(private adminSvc: AdminService,
              private changeDet: ChangeDetectorRef, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.getTopics();
    this.form = this.fb.group({
      name: [<string>'', Validators.required]
    });
  }

  getTopics() {
    this.adminSvc.getTopics().subscribe(
      (topics: any) => {
        this.topics = topics;
        this.changeDet.markForCheck();
      }
    );
  }

  addTopic() {
    if (this.form.valid) {
      this.adminSvc.addTopic(this.form.get('name').value).subscribe(
        (topic: any) => {
          this.topics.unshift(topic);
          this.form.reset();
          this.changeDet.markForCheck();
        }
      );
    }
  }

}
