import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Logout, UpdateToken } from '@shared/state/user/user.actions';
import { AddAlert } from '@shared/state';
import { AlertTypes } from '@shared/classes';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private store: Store<any>, private router: Router) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return this.store.select('user').take(1).switchMap(
            (user) => {
                if (!request.headers.get('External')) {
                    request = request.clone({
                        setHeaders: {
                            "x-access-token": user.token || '',
                            "refresh-token": user.refresh || ''
                        }
                    });
                }

                return next.handle(request).map(
                    (event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            if (event.headers.get('refreshed-token')) {
                                this.store.dispatch(new UpdateToken(event.headers.get('refreshed-token')));
                            }
                            return event;
                        }
                    })
                    .catch((err) => {
                        if (err instanceof HttpErrorResponse) {
                            if (err.status === 403) {
                                this.store.dispatch(new Logout());
                                this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: "Unauthorized", message: "Please check your credentials." }));
                                return Observable.throw("Unauthorized");
                            }
                            if( err.status === 101){
                                return Observable.throw("Switching protocols");
                            }
                        }
                        if (err.error instanceof Blob) {
                            const reader = new FileReader();

                            reader.onload = (readerEvent: any) => {
                                try {
                                    err.error = JSON.parse(readerEvent.target.result);
                                    if (err.error && err.error.title && err.error.message) {
                                        this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: err.error.title, message: err.error.message }));
                                    } else {
                                        this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: "Server Error", message: "Error communicating with the server." }));
                                    }
                                } catch (e) {
                                    this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: "Server Error", message: "Error communicating with the server." }));
                                }
                            };
                            reader.readAsText(err.error);
                            return Observable.throw(err);
                        }
                        if (err.error && err.error.title && err.error.message) {
                            this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: err.error.title, message: err.error.message }));
                        } else {
                            this.store.dispatch(new AddAlert({ type: AlertTypes.ERROR, title: "Server Error", message: "Error communicating with the server." }));
                        }
                        return Observable.throw(err);
                    });
            }
        );


    }

}