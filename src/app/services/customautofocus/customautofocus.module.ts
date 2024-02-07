import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomautofocusDirective } from '../customautofocus.directive';



@NgModule({
  declarations: [CustomautofocusDirective],
  exports: [CustomautofocusDirective]
})
export class CustomautofocusModule { }
