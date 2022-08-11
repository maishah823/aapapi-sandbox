import {Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';
import {ENTER, COMMA} from '@angular/cdk/keycodes';
import {EditableService} from '@shared/editable/editable.service';
import {InstructorService} from '@shared/components/instructor/instructor.service';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state/alerts';
import {AlertTypes} from '@shared/classes';
import {UUID} from 'angular2-uuid';
import {environment} from '../../../../environments/environment';
import {InstructorInfoUpdated} from '@shared/state';
import {PhotoResizeService} from '@shared/services/photo-resize.service';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'aapp-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.scss']
})
export class InstructorComponent implements OnInit {

  @Input() instructorInfo: any = {};
  @Input() topics;
  @Input() admin;
  @ViewChild('topicInput') topicInput: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;

  instructorImagesURL = environment.INSTRUCTOR_IMAGES;
  hover: Boolean = false;
  uploadInProgress = false;

  form: UntypedFormGroup;

  filteredTopics: Observable<any[]>;

  seperatorKeyCodes = [ENTER, COMMA];

  constructor(private resize: PhotoResizeService, private store: Store<any>,
              private fb: UntypedFormBuilder, private changeDet: ChangeDetectorRef,
              private editableSvc: EditableService, private instructorSvc: InstructorService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      chip: ''
    });

    this.filteredTopics = this.form.get('chip').valueChanges.pipe(map((textInput) => {
      const regex = new RegExp(textInput + '/gi');
      return this.topics.filter((t) => {
        if (t.name.match(regex)) {
          return t;
        }
      });
    })).pipe(startWith(this.topics));

  }

  remove(topic) {
    if (!this.instructorInfo) {
      return;
    }
    if (topic.name === 'General') {
      return;
    }
    this.instructorSvc.removeTopic(this.instructorInfo.user, topic._id).subscribe(() => {
      this.instructorInfo.topics = this.instructorInfo.topics.filter((obj) => {
        if (obj !== topic) {
          return obj;
        }
      });
      this.changeDet.markForCheck();
    });


  }

  add(e) {
    // console.log("Add",e)
    // if (this.form.get('chip').value && typeof this.form.get('chip').value == 'string') {
    //   var selected;
    //   this.topics.forEach((topic) => {
    //     console.log(topic.name,this.form.get('chip').value);
    //     if (topic.name.toLowerCase() == this.form.get('chip').value.toLowerCase()) {
    //       selected = topic;
    //     }
    //   });
    //   if (selected) {
    //     this.selected({ option: { value: selected } });
    //   }
    setTimeout(() => {
      this.topicInput.nativeElement.value = '';
      this.form.reset();
    }, 1000);

    // }
  }

  selected(e) {
    if (!this.instructorInfo) {
      return;
    }
    let exists = false;
    this.instructorInfo.topics.forEach(element => {
      if (element._id === e.option.value._id) {
        exists = true;
      }
    });
    if (exists) {
      return;
    }
    this.instructorSvc.addTopic(this.instructorInfo.user, e.option.value._id).subscribe(() => {
      this.instructorInfo.topics.push(e.option.value);
      this.topicInput.nativeElement.value = '';
      this.topicInput.nativeElement.blur();
    });

  }

  editTitle() {
    this.editableSvc.editText('Edit Title', 'What is your job title?', this.instructorInfo.title)
      .subscribe(
        (res: any) => {
          if (res) {
            this.instructorSvc.updateInstructor(this.instructorInfo.user, 'title', res).subscribe(() => {
              this.instructorInfo.title = res;
              this.checkCompleteness();
              this.changeDet.markForCheck();
            });
          }

        }
      );
  }

  editEducation() {
    this.editableSvc.editText('Edit Education', 'A blurb about your education...', this.instructorInfo.education)
      .subscribe(
        (res: any) => {

          if (res) {
            this.instructorSvc.updateInstructor(this.instructorInfo.user, 'education', res).subscribe(() => {
              this.instructorInfo.education = res;
              this.changeDet.markForCheck();
            });
          }
        }
      );
  }

  editResearch() {
    this.editableSvc.editText('Edit Research', 'A blurb about what research you have done...', this.instructorInfo.research)
      .subscribe(
        (res: any) => {

          if (res) {
            this.instructorSvc.updateInstructor(this.instructorInfo.user, 'research', res).subscribe(() => {
              this.instructorInfo.research = res;
              this.changeDet.markForCheck();
            });
          }
        }
      );
  }

  editSummary() {
    this.editableSvc.editText('Edit Summary', 'Summarize your career and experience...', this.instructorInfo.summary)
      .subscribe(
        (res: any) => {

          if (res) {
            this.instructorSvc.updateInstructor(this.instructorInfo.user, 'summary', res).subscribe(() => {
              this.instructorInfo.summary = res;
              this.checkCompleteness();
              this.changeDet.markForCheck();
            });
          }
        }
      );
  }

  // ------------ FILES -------------------
  filesChanged(file) {
    if (this.checkFile(file)) {
      this.uploadFile(file);
    }

  }

  filesChosen(e) {
    const files: FileList = e.srcElement.files;
    if (files.length > 0) {
      if (this.checkFile(files[0])) {
        this.uploadFile(files[0]);
      }

    } else {
      this.showError('Could not detect file.');
    }
  }

  checkFile(file) {
    if (!(/^image\//.test(file.type))) {
      this.showError('The file, ' + file.name + ' does not appear to be a recognized picture file.');
      return false;
    } else if (file.size > 20971520) {
      this.showError('Sorry, ' + file.name + ' is too large. Files must be less than 20 MB.');
      return false;
    } else {
      return true;
    }
  }

  uploadFile(file) {

    this.uploadInProgress = true;
    // generate a unique name for the file
    const generatedName = UUID.UUID();
    const split = file.name.split('.');
    const ext = split[split.length - 1];
    const newFileName = generatedName + '.' + ext;

    // let reader = new FileReader();
    // reader.readAsDataURL(file);


    this.instructorSvc.getSignedUploadURL(file, newFileName).subscribe(
      async (res: any) => {
        const resizedFile = await this.resize.resizeImage(file);
        this.instructorSvc.uploadImage(res.url, resizedFile.blob).subscribe(
          res2 => {
            this.instructorSvc.updateInstructorImage(this.instructorInfo.user, newFileName).subscribe(() => {
              setTimeout(() => {
                this.instructorInfo.picture = newFileName;
                this.checkCompleteness();
                this.uploadInProgress = false;
                this.changeDet.markForCheck();
              }, 4000);
            });
          },
          error => {
            console.error(error);
            this.uploadInProgress = false;
            this.showError('Error uploading image.');
          }
        );
      }
    );
  }


  showError(error) {
    this.store.dispatch(new AddAlert({type: AlertTypes.ERROR, title: 'File Upload', message: 'Error loading image.'}));
  }


  fileOver(e) {
    this.hover = e;
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  checkCompleteness() {
    if (this.instructorInfo.picture && this.instructorInfo.title && this.instructorInfo.summary) {
      this.store.dispatch(new InstructorInfoUpdated());
    }
  }
}
