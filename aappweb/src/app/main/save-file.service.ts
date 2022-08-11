import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { WindowAgentService } from './window-agent.service';
import { Store } from '@ngrx/store';
import { AddAlert } from '@shared/state';
import { AlertTypes } from '@shared/classes';

@Injectable()
export class SaveFileService {

  constructor(private devices:WindowAgentService,private store:Store<any>) { }

  saveOrView(blob,filename,type?){
    if(this.devices.isMobile() && type){
      const newBlob = new Blob([blob],{type});
          const data = window.URL.createObjectURL(newBlob);
          window.open(data);
    }else{
      const newBlob = new Blob([blob],{type});
      FileSaver.saveAs(newBlob, filename);
      this.store.dispatch(new AddAlert({ type: AlertTypes.INFO, title: 'DOWNLOAD', message: 'The file will be saved in your default downloads folder.' }));
    }
    
  }

}
