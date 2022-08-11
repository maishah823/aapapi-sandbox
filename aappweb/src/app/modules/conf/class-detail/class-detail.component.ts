import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfServiceService} from '@conf/services/conf-service.service';
import {environment} from 'environments/environment';
import {Location} from '@angular/common';
import {Store} from '@ngrx/store';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes';
import {UUID} from 'angular2-uuid';
import {EditableService} from '@shared/editable/editable.service';
import {SaveFileService} from 'app/main/save-file.service';
import {WindowAgentService} from 'app/main/window-agent.service';

@Component({
  selector: 'app-class-detail',
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss']
})
export class ClassDetailComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;
  course: any = {};
  instructorImagesURL = environment.INSTRUCTOR_IMAGES;
  filesURL = environment.FILES;
  hasInstructorPermission = false;
  userId = null;
  uploadInProgress = false;
  FILE_BASE = environment.FILES + '/';

  constructor(public devices: WindowAgentService, private files: SaveFileService,
              private store: Store<any>, private editableSvc: EditableService,
              private location: Location, private changeDet: ChangeDetectorRef,
              private route: ActivatedRoute, private confSvc: ConfServiceService, private router: Router) {
  }

  ngOnInit() {
    this.getClass(this.route.snapshot.params['id']);
    this.store.select('user').subscribe((user) => {
      console.log(user);
      this.hasInstructorPermission = user.isInstructor;
      this.userId = user._id;
    });
  }

  isInstructor() {
    let isOwnClass = false;
    for (let i = 0; i < this.course.instructors.length; i++) {
      if (this.course.instructors[i]._id == this.userId) {
        isOwnClass = true;
        break;
      }
    }
    return isOwnClass && this.hasInstructorPermission;
  }

  getClass(id) {
    this.confSvc.getClassroomDetail(id).subscribe(
      (res: any) => {
        this.course = res;
        this.changeDet.markForCheck();
      }
    );
  }

  goBack() {
    this.location.back();
  }

  addToSchedule() {
    this.confSvc.addClassToCustomSchedule(this.course._id)
      .subscribe(() => {
        this.router.navigate(['/web/conf/custom-schedule']);
      });
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  filesChosen(e) {
    let files: FileList = e.srcElement.files;

    console.log(files);
    if (files.length > 0) {
      if (this.checkFile(files[0])) {
        this.uploadFile(files[0]);
        e.srcElement.value = '';
      }

    } else {
      this.showError('Could not detect file.');
    }
  }

  checkFile(file) {
    // if (!(/^image\//.test(file.type))) {
    //   this.showError("The file, " + file.name + " does not appear to be a recognized picture file.");
    //   return false;
    // } else if (file.size > 20971520) {
    //   this.showError("Sorry, " + file.name + " is too large. Files must be less than 20 MB.");
    //   return false;
    // } else {
    //   return true;
    // }
    return true;
  }

  uploadFile(file) {

    this.uploadInProgress = true;
    // //generate a unique name for the file
    let generatedName = UUID.UUID();
    let split = file.name.split('.');
    let ext = split[split.length - 1];
    let newFileName = generatedName + '.' + ext;

    // let reader = new FileReader();
    // reader.readAsDataURL(file);

    this.editableSvc.editText('Resource Title', 'Provide a name for the file.', null)
      .subscribe(
        (name) => {

          if (!name) {
            return;
          }


          this.confSvc.getSignedMaterialUpload(this.course._id, file, newFileName).subscribe(
            async (res: any) => {
              console.log(res);
              this.confSvc.uploadFile(res.url, file).subscribe(
                res2 => {
                  this.confSvc.makeFileRecord(newFileName, this.course._id, name + '.' + ext).subscribe(() => {

                    this.uploadInProgress = false;
                    this.course.materials.push({title: name + '.' + ext, filename: newFileName, _id: 'temp'});
                    this.changeDet.markForCheck();

                  });
                },
                error => {
                  console.error(error);
                  this.uploadInProgress = false;
                  this.showError('Error uploading file.');
                }
              );
            }
          );
        }
      );
  }


  showError(error) {
    this.store.dispatch(new AddAlert({type: AlertTypes.ERROR, title: 'File Upload', message: 'Error uploading file.'}));
  }

  download(filename, title) {
    this.confSvc.downloadFile(filename).subscribe((file) => {
      this.files.saveOrView(file, title);
    });
  }

  deleteMaterial(id) {
    this.confSvc.deleteMaterial(id).subscribe(() => {
      this.getClass(this.route.snapshot.params['id']);
    });
  }

}
