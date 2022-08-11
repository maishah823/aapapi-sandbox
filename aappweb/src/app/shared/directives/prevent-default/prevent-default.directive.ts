import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[aappPreventDefault]'
})
export class PreventDefaultDirective {

  constructor() { }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("Prevent default")
  }

}
