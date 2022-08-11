import {Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {UUID} from 'angular2-uuid';
import {MembersService} from '@members/members.service';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes/Alert';
import {environment} from '../../../../environments/environment';
import {LightboxComponent} from './dialogs/lightbox/lightbox.component';
import {CaptionComponent} from '@members/photos/dialogs/caption/caption.component';
import {UntypedFormGroup, UntypedFormBuilder} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {PhotoResizeService} from '@shared/services/photo-resize.service';
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss']
})
export class PhotosComponent implements OnInit, OnDestroy {

  uploadInProgress = false;
  @ViewChild('fileInput') fileInput: ElementRef;

  memberGalleryURL = environment.MEMBER_GALLERY;
  hover: Boolean = false;
  showDrop: Boolean = false;

  newImages: any[] = [];
  images: any = [];

  page = 1;
  limit = 20;
  total = 0;
  pages = 1;

  filterForm: UntypedFormGroup;

  filterSub: Subscription;

  constructor(private resize: PhotoResizeService, private store: Store<any>,
              private membersSvc: MembersService, private changeDet: ChangeDetectorRef,
              private dialog: MatDialog, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {

    this.filterForm = this.fb.group({
      album: ''
    });

    this.filterSub = this.filterForm.valueChanges.subscribe(
      () => {
        this.getImages();
      }
    );

    this.getImages();
  }

  ngOnDestroy() {
    if (this.filterSub) {
      this.filterSub.unsubscribe();
    }
  }

  getImages() {
    this.membersSvc.getMemberGalleryImages(this.page, this.limit, this.filterForm.get('album').value).subscribe(
      (res: any) => {
        this.showDrop = false;
        this.newImages = [];
        this.images = res.docs;
        this.page = res.page;
        this.limit = res.limit;
        this.total = res.total;
        this.pages = res.pages;
        this.changeDet.markForCheck();
      }
    );
  }

  pageEvent(e) {
    this.page = e.pageIndex + 1;
    this.limit = parseInt(e.pageSize);
    this.getImages();
    this.newImages = [];
  }

  // ------------ FILES -------------------
  filesChanged(file) {
    if (this.checkFile(file)) {
      this.uploadFile(file);
    }

  }

  filesChosen(e) {
    let files: FileList = e.srcElement.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (this.checkFile(files[i])) {
          this.uploadFile(files[i]);
        }
      }
    } else {
      this.showError('Could not detect any files.');
    }
  }

  checkFile(file) {
    let split = file.name.split('.');
    let ext = split[split.length - 1];
    if (ext != 'jpg' && ext != 'JPG' && ext != 'jpeg' && ext != 'JPEG' && ext != 'png' && ext != 'PNG' && ext != 'GIF' && ext != 'gif') {
      this.showError('Error uploading ' + file.name + ' - This type of file is not supported.');
      return false;
    } else if (!(/^image\//.test(file.type))) {
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

    this.dialog.open(CaptionComponent, {width: '400px', data: {file: file.name}}).afterClosed().subscribe(
      (returnedData: any) => {
        if (!returnedData) {
          this.uploadInProgress = false;
          return;
        }
        this.uploadInProgress = true;
        //generate a unique name for the file
        let generatedName = UUID.UUID();
        let split = file.name.split('.');
        let ext = split[split.length - 1];
        let newFileName = generatedName + '.' + ext;


        //Upload
        this.membersSvc.getSignedUploadURL(file, newFileName).subscribe(
          async (res: any) => {

            let resizedFile = await this.resize.resizeImage(file);

            this.membersSvc.uploadImage(res.url, resizedFile.blob).subscribe(
              (uploadRes) => {
                let self = this;
                this.membersSvc.saveGalleryImage(returnedData.caption, returnedData.album, newFileName).subscribe(
                  () => {

                    this.newImages.push({
                      file: resizedFile.dataUrl,
                      filename: newFileName,
                      caption: returnedData.caption,
                      album: returnedData.album
                    });

                    self.uploadInProgress = false;
                    self.changeDet.markForCheck();
                  },
                  (err) => {
                    console.error(err);
                    this.uploadInProgress = false;
                  });
              },
              error => {
                console.error(error);
                this.uploadInProgress = false;
                this.showError('Error uploading image.');
              }
            );
          },
          (err) => {
            console.error(err);
            this.uploadInProgress = false;
            this.showError('Error uploading image.');
          }
        );
        //----
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

  openLightbox(filename, caption, by, at) {

    let created_by = by || 'Uploaded';
    let created_at = at || new Date();

    const dialogRef = this.dialog.open(LightboxComponent, {
      width: '90%',
      height: '90%',
      data: {imageUrl: this.memberGalleryURL + '/' + filename, caption, created_by, created_at}
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }


}
