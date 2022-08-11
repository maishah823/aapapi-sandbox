import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AdminService} from '@admin/services/admin.service';
import {Location} from '@angular/common';
import {environment} from 'environments/environment';
import {Store} from '@ngrx/store';
import {UUID} from 'angular2-uuid';
import {PhotoResizeService} from '@shared/services/photo-resize.service';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss']
})
export class EditPostComponent implements OnInit {

  form: UntypedFormGroup;
  file: string;
  edit = false;
  post: any;
  editor: any;
  options = {
    height: 400,
    key: '1F4J4C7D7eF5C4B3D4E2B2B6D6A3C2xrqpD3hgnE-11dmnB-7pad1A-13vC-9vlpuusA-13nplhaftjjD-13oF-10kH-8ddA-21D-17cE1A-9as==',
    imageUploadURL: environment.API_URI + '/blogs/upload-from-froala',
    imageUploadMethod: 'PUT',
    fileUploadURL: environment.API_URI + '/blogs/upload-from-froala',
    fileUploadMethod: 'PUT',
    imageDefaultMargin: 15,
    imageMaxSize: 5 * 1024 * 1024,
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    linkText: true,
    linkAutoPrefix: 'http://',
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: false,
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough',
      'subscript', 'superscript', '|', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat',
      'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertFile',
      'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print',
      'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    events: {
      'froalaEditor.initialized': ((e, editor) => {
        this.editor = editor;
        editor.opts.requestHeaders = {
          'x-access-token': this.route.snapshot.data['user']['token'] || '',
          'refresh-token': this.route.snapshot.data['user']['refresh'] || ''
        };
      }).bind(this),
      'froalaEditor.image.beforeUpload': function (images) {

        // Do something here.
        // this is the editor instance.
        return true;

      },
    }

  };

  uploadInProgress = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  imageUrl = environment.BLOG_IMAGES;
  hover: Boolean = false;
  showDrop: Boolean = false;

  get _id(): UntypedFormControl {
    return this.form.get('_id') as UntypedFormControl;
  }

  get type(): UntypedFormControl {
    return this.form.get('type') as UntypedFormControl;
  }

  get body(): UntypedFormControl {
    return this.form.get('body') as UntypedFormControl;
  }

  get summary(): UntypedFormControl {
    return this.form.get('summary') as UntypedFormControl;
  }

  get title(): UntypedFormControl {
    return this.form.get('title') as UntypedFormControl;
  }

  get coverImg(): UntypedFormControl {
    return this.form.get('coverImg') as UntypedFormControl;
  }

  constructor(private store: Store<any>, private fb: UntypedFormBuilder, private route: ActivatedRoute,
              private adminSvc: AdminService, private changeDet: ChangeDetectorRef, private location: Location,
              private router: Router, private resize: PhotoResizeService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      _id: null,
      type: 'public',
      body: ['', Validators.required],
      summary: ['', Validators.required],
      title: ['', Validators.required],
      coverImg: ['', Validators.required],
    });
    if (this.route.snapshot.params['id']) {
      this.getPost();
      this.edit = true;
    }
  }

  getPost() {
    this.adminSvc.getSingleBlog(this.route.snapshot.params['id']).subscribe(
      (res: any) => {
        if (res) {
          this.post = res;
          this.file = this.imageUrl + '/' + res.coverImg;
          this._id.setValue(res._id);
          this.type.setValue(res.type);
          this.body.setValue(res.body);
          this.summary.setValue(res.summary);
          this.title.setValue(res.title);
          this.coverImg.setValue(res.coverImg);
          this.changeDet.markForCheck();
        }
      }
    );
  }

  submit() {
    if (this.form.valid) {

      this.adminSvc.addBlog({
        _id: this._id.value,
        type: this.type.value,
        body: this.body.value,
        summary: this.summary.value,
        title: this.title.value,
        coverImg: this.coverImg.value
      }).subscribe(
        () => {
          this.form.reset();
          this.router.navigate(['/web/admin/posts']);
        }
      );
    }
  }

  cancel() {
    this.location.back();
  }

  imageError(e) {
    e.target.src = '/assets/images/add_cover_image.png';
  }


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


    this.uploadInProgress = true;
    //generate a unique name for the file
    let generatedName = UUID.UUID();
    let split = file.name.split('.');
    let ext = split[split.length - 1];
    let newFileName = generatedName + '.' + ext;

    //Upload
    this.adminSvc.getSignedBlogURL(file, newFileName).subscribe(
      async (res: any) => {
        let self = this;
        let resizedFile = await this.resize.resizeImage(file);

        this.adminSvc.uploadBlogImage(res.url, resizedFile.blob).subscribe(
          () => {
            self.form.get('coverImg').setValue(newFileName);
            self.file = resizedFile.dataUrl;
            self.uploadInProgress = false;
            self.changeDet.markForCheck();
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

  }

  showError(error) {

  }


  fileOver(e) {
    this.hover = e;
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

}
