import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimekitModule } from '../../services/primekit/primekit.module';

import { ProdukRoutingModule } from './produk-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgSelectModule } from '@ng-select/ng-select';
import { ProdukComponent } from './produk.component';
import { GambarProdukComponent } from './gambar-produk/gambar-produk.component';
import { CustomProdukComponent } from './custom-produk/custom-produk.component';
import { CustomautofocusModule } from 'src/app/services/customautofocus/customautofocus.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';


@NgModule({
  declarations: [ProdukComponent, GambarProdukComponent, CustomProdukComponent],
  imports: [
    CommonModule,
    ProdukRoutingModule,
    FormsModule, ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    PrimekitModule,
    CustomautofocusModule
  ],
  providers: [MessageService, ConfirmationService, ApiService]
})
export class ProdukModule { }
