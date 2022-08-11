import {
  Directive,
  Output,
  OnDestroy,
  OnInit,
  Injector,
  EventEmitter,
  ApplicationRef,
  ViewContainerRef,
  ComponentRef,
  HostListener,
  ComponentFactoryResolver,
  ComponentFactory
} from '@angular/core';
import {LoginComponent} from '../components/login/login.component';
import {AppComponent} from 'app/main/app.component';
import {Subscription} from 'rxjs/Subscription';


@Directive({
  selector: '[loginPopover]',
  exportAs: 'loginDir'
})
export class LoginPopoverDirective implements OnDestroy, OnInit {

  @Output() executeLogin: EventEmitter<any>;
  popover: ComponentRef<LoginComponent>;
  root: ViewContainerRef;
  clickedOutsideSub: Subscription;

  // Dimensions
  width: 300;
  x: 0;
  y: 0;

  constructor(private injector: Injector, private viewContainerRef: ViewContainerRef,
              private resolver: ComponentFactoryResolver, private appRef: ApplicationRef) {

  }

  ngOnInit() {


    this.root = (this.appRef.components[0].instance as AppComponent).viewRef;
  }

  ngOnDestroy() {
    this.hide();
    if (this.clickedOutsideSub) {
      this.clickedOutsideSub.unsubscribe();
    }
  }

  @HostListener('click')
  onclick() {
    this.toggle();
  }

  public autoOpen() {
    if (!this.popover) {
      this.show();
    }
  }

  toggle() {
    if (this.popover) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    const factory = this.resolver.resolveComponentFactory(LoginComponent);
    this.popover = this.root.createComponent(factory);
    this.clickedOutsideSub = this.popover.instance.done.subscribe((done: boolean) => {
      if (done) {
        this.hide();
        this.clickedOutsideSub.unsubscribe();
      }
    });
  }

  hide() {
    if (this.popover) {
      this.popover.destroy();
    }
    this.popover = null;
  }

}
