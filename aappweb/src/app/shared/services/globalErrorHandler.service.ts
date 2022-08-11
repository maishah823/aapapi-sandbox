import { ErrorHandler, Injector, Injectable,NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { AddAlert } from '../state/alerts';
import { AlertTypes} from '../classes';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {

    constructor(private injector: Injector) {
        super();
    }

    handleError(error) {
        if (/Loading chunk .* failed/.test(error.message)) {
            let store = this.injector.get(Store);
            if (store) {
                let zone = this.injector.get(NgZone);
                zone.run(()=>{
                    store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: 'Offline', message: 'Please check your network connection.' })); 
                });
                    
            }
        }
        if (!environment.production) {
            super.handleError(error);
        }else{

        }

    }
}