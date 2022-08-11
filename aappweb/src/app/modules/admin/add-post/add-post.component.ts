import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {AdminService} from '@admin/services/admin.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UUID} from 'angular2-uuid';
import {AddAlert} from '@shared/state';
import {AlertTypes} from '@shared/classes/Alert';
import {environment} from '../../../../environments/environment';
import {Store} from '@ngrx/store';
import {PhotoResizeService} from '@shared/services/photo-resize.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit, OnDestroy {

  form: UntypedFormGroup;
  file: string;

  editor: any;
  options = {
    key: '1F4J4C7D7eF5C4B3D4E2B2B6D6A3C2xrqpD3hgnE-11dmnB-7pad1A-13vC-9vlpuusA-13nplhaftjjD-13oF-10kH-8ddA-21D-17cE1A-9as==',
    height: 300,
    linkText: true,
    linkAutoPrefix: 'http://',
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: false,
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough',
      'subscript', 'superscript', '|', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle',
      '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-',
      'insertLink', 'embedly', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll',
      'clearFormatting', '|', 'print', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    events: {
      'froalaEditor.initialized': (e, editor) => {
        this.editor = editor;
      }
    }
  };

  uploadInProgress = false;
  @ViewChild('fileInput') fileInput: ElementRef;

  imageUrl = environment.BLOG_IMAGES;
  hover: Boolean = false;
  showDrop: Boolean = false;

  edit = false;
  post: any;

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


  constructor(private location: Location, private changeDet: ChangeDetectorRef,
              private resize: PhotoResizeService, private fb: UntypedFormBuilder,
              private adminSvc: AdminService, private router: Router,
              private store: Store<any>, private route: ActivatedRoute) {
  }

  ngOnInit() {
    console.log(this.route.snapshot.params['id']);
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

  ngOnDestroy() {

  }

  getPost() {
    this.adminSvc.getSingleBlog(this.route.snapshot.params['id']).subscribe(
      (res: any) => {
        if (res) {
          this.post = res;
          this._id.setValue(res._id);
          this.type.setValue(res.type);
          this.body.setValue(res.body);
          this.summary.setValue(res.summary);
          this.title.setValue(res.title);
          this.coverImg.setValue(res.coverImg);
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

  filesChanged(file) {
    if (this.checkFile(file)) {
      this.uploadFile(file);
    }

  }

  filesChosen(e) {
    const files: FileList = e.srcElement.files;
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
    const split = file.name.split('.');
    const ext = split[split.length - 1];
    if (ext !== 'jpg' && ext !== 'JPG' && ext !== 'jpeg'
      && ext !== 'JPEG' && ext !== 'png' && ext !== 'PNG' && ext !== 'GIF' && ext !== 'gif') {
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
    // generate a unique name for the file
    const generatedName = UUID.UUID();
    const split = file.name.split('.');
    const ext = split[split.length - 1];
    const newFileName = generatedName + '.' + ext;


    // Upload
    this.adminSvc.getSignedBlogURL(file, newFileName).subscribe(
      async (res: any) => {
        const self = this;
        const resizedFile = await this.resize.resizeImage(file);

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
    this.store.dispatch(new AddAlert({type: AlertTypes.ERROR, title: 'File Upload', message: 'Error loading image.'}));
  }


  fileOver(e) {
    this.hover = e;
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  goBack() {
    this.location.back();
  }


}
