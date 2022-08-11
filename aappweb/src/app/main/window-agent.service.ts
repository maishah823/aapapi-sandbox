import { Injectable } from '@angular/core';

@Injectable()
export class WindowAgentService {

  constructor() { }

  isStandAlone(){
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator['standalone'];
  }

  iPhone(){
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipod/.test( userAgent );
  }

  iPad(){
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /ipad/.test( userAgent );
  }

  isMobile(){
    return (/Mobi|Android/i.test(window.navigator.userAgent));
  }

}
