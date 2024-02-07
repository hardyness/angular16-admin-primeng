import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appCustomautofocus]'
})
export class CustomautofocusDirective implements AfterViewInit {

  constructor(private element: ElementRef<HTMLInputElement>){
    
  }

  ngAfterViewInit(): void {
    this.element.nativeElement.focus();
  }

}
