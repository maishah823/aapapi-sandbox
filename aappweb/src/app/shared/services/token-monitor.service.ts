import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Logout } from '@shared/state';
import { AddAlert } from '@shared/state';
import { Alert, AlertTypes } from '@shared/classes';
import {JwtHelperService} from '@auth0/angular-jwt';
@Injectable()
export class TokenMonitorService {

    constructor(store: Store<any>, jwt: JwtHelperService) {
        check();
        setInterval(() => {
            check();
        }, 60000);
        function check(){
            store.select('user').take(1).subscribe(user => {
                //REMOVE THIS
                if (user && user.isLoggedIn) {
                    if (user.refresh) {
                        if (jwt.isTokenExpired(user.refresh)) {
                            store.dispatch(new Logout());
                            store.dispatch(new AddAlert({type:AlertTypes.INFO,title:'EXPIRED', message:'Your past session has expired and you have been logged out.'} as Alert));
                        }
                    } else {
                        store.dispatch(new Logout());
                    }
                }
            });
        }
    }
}
