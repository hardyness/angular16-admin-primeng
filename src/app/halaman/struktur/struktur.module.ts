import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimekitModule } from '../../services/primekit/primekit.module';

import { StrukturRoutingModule } from './struktur-routing.module';
import { StrukturComponent } from './struktur.component';
import { CustomautofocusModule } from 'src/app/services/customautofocus/customautofocus.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from 'src/app/services/api.service';
import { Struktur1Component } from './struktur1/struktur1.component';
import { Struktur2Component } from './struktur2/struktur2.component';
import { Struktur3Component } from './struktur3/struktur3.component';
import { TestbreadComponent } from './testbread/testbread.component';


@NgModule({
  declarations: [StrukturComponent, Struktur1Component, Struktur2Component, Struktur3Component, TestbreadComponent],
  imports: [
    CommonModule,
    StrukturRoutingModule,
    FormsModule, ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    PrimekitModule,
    CustomautofocusModule
  ],
  providers: [MessageService, ConfirmationService, ApiService]
})
export class StrukturModule { }
