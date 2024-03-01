import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimekitModule } from '../../services/primekit/primekit.module';

import { PenggunaRoutingModule } from './pengguna-routing.module';
import { PenggunaComponent } from './pengguna.component';
import { CustomautofocusModule } from 'src/app/services/customautofocus/customautofocus.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgSelectModule } from '@ng-select/ng-select';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AksesLevelPenggunaComponent } from './akses-level-pengguna/akses-level-pengguna.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { GajiSinkComponent } from './gaji-sink/gaji-sink.component';


@NgModule({
  declarations: [PenggunaComponent, AksesLevelPenggunaComponent, GajiSinkComponent],
  imports: [
    CommonModule,
    PenggunaRoutingModule,
    PrimekitModule,
    CustomautofocusModule,
    FormsModule, ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    TranslateModule.forRoot()
  ],
  providers: [ConfirmationService, MessageService, ApiService],
})
export class PenggunaModule { }
