import {HostListener, Directive, ElementRef, EventEmitter, Output} from '@angular/core';


@Directive({
  selector: '[fileDrop]'
})
export class FileDropDirective {

  constructor(private el: ElementRef) {
  }

  @Output() private filesChanged: EventEmitter<File> = new EventEmitter();
  @Output() private fileOver: EventEmitter<Boolean> = new EventEmitter();
  @Output() private error: EventEmitter<String> = new EventEmitter();

  @HostListener('window:drop', ['$event']) onGlobalDrop(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('dragover', ['$event']) onDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('drop', ['$event']) onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    let files = event.dataTransfer.files;
    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file: File = files[i];
        if (file.size > 20971520) {
          this.error.emit('Sorry, ' + file.name + ' is too large. Files must be less than 20 MB.');
        } else {
          this.filesChanged.emit(file);
        }

      }

    }
    this.fileOver.emit(false);
  }

  @HostListener('dragenter', ['$event']) onEnter(event) {
    this.fileOver.emit(true);
  }

  @HostListener('dragleave', ['$event']) onLeave(event) {
    this.fileOver.emit(false);
  }

  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.fileOver.emit(false);
  }


}
