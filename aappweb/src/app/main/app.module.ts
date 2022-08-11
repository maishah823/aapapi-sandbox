import {DomSanitizer} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StoreModule, ActionReducer, MetaReducer} from '@ngrx/store';
import {localStorageSync} from 'ngrx-store-localstorage';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {MnFullpageModule, MnFullpageService} from 'ngx-fullpage';
import {routes} from './app.routes';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../../environments/environment';


// Components
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';

// Services
import {AppPreloaderService, TokenInterceptor} from '@shared/services';
import {AppService} from './app.service';
import {WindowAgentService} from './window-agent.service';
import {SaveFileService} from './save-file.service';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MAT_RIPPLE_GLOBAL_OPTIONS} from '@angular/material/core';
import {JwtModule, JwtModuleOptions} from '@auth0/angular-jwt';


// Directives


// Detect IE
const ua = window.navigator.userAgent;
let animationModule: any = BrowserAnimationsModule;
let disableRipples = false;

if (ua.indexOf('MSIE') >= 0 || ua.indexOf('Trident/') >= 0) {
  animationModule = NoopAnimationsModule;
  disableRipples = true;
}


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['user', 'ui', 'forms', 'blog'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];
const JWT_Module_Options: JwtModuleOptions = {
  config: {
    tokenGetter: () => {
      return sessionStorage.getItem("user.token");
    },
  }
};

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    animationModule,
    HttpClientModule,
    ServiceWorkerModule.register('./ngsw-worker.js', {
      enabled: environment.production,
    }),
    JwtModule.forRoot(JWT_Module_Options),
    MnFullpageModule.forRoot(),
    RouterModule.forRoot(routes, {preloadingStrategy: AppPreloaderService}),
    StoreModule.forRoot({}, {metaReducers}),
    StoreDevtoolsModule.instrument({
      maxAge: 25, //  Retains last 25 states
    }),
    EffectsModule.forRoot([]),
    MatIconModule,
    MatButtonModule,
  ],
  exports: [RouterModule],
  providers: [
    AppService,
    WindowAgentService,
    AppPreloaderService,
    MnFullpageService,
    MatIconRegistry,
    [
      {
        provide: MAT_RIPPLE_GLOBAL_OPTIONS,
        useValue: {disabled: disableRipples},
      },
    ],
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    SaveFileService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(iconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    iconRegistry.addSvgIconInNamespace(
      'assets',
      'readout',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/readout.svg')
    );
    iconRegistry.addSvgIconInNamespace(
      'assets',
      'logo',
      domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/images/logo_white.svg'
      )
    );
    iconRegistry.addSvgIconInNamespace(
      'assets',
      'join',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/images/join.svg')
    );
    iconRegistry.addSvgIconInNamespace(
      'assets',
      'conference',
      domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/images/conference.svg'
      )
    );
  }
}
