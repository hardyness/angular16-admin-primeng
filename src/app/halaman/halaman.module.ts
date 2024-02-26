import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimekitModule } from '../services/primekit/primekit.module';

import { HalamanRoutingModule } from './halaman-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HalamanComponent } from './halaman.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgSelectModule } from '@ng-select/ng-select';
import { KatalogComponent } from './katalog/katalog.component';
import { ProdukModule } from './produk/produk.module';
import { TentangKamiComponent } from './tentang-kami/tentang-kami.component';
import { ApiService } from '../services/api.service';
import { CustomautofocusModule } from '../services/customautofocus/customautofocus.module';
import { SeoComponent } from './seo/seo.component';
import { PengunjungComponent } from './pengunjung/pengunjung.component';
import { KontakComponent } from './kontak/kontak.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { KantorComponent } from './kantor/kantor.component';
import { PekerjaanComponent } from './pekerjaan/pekerjaan.component';
import { JaminanComponent } from './jaminan/jaminan.component';
import { GolonganComponent } from './golongan/golongan.component';
import { StrukturModule } from './struktur/struktur.module';
import { PenggunaModule } from './pengguna/pengguna.module';
import { GajiLayoutComponent } from './gaji-layout/gaji-layout.component';
import { HeaderComponent } from './header/header.component';
import { TipepembiayaanComponent } from './tipepembiayaan/tipepembiayaan.component';
import { AreaComponent } from './area/area.component';
import { CoaComponent } from './coa/coa.component';


@NgModule({
  declarations: [
    DashboardComponent, HalamanComponent, KatalogComponent, TentangKamiComponent, SeoComponent, PengunjungComponent, KontakComponent, KantorComponent, PekerjaanComponent, JaminanComponent, GolonganComponent, GajiLayoutComponent, HeaderComponent, TipepembiayaanComponent, AreaComponent, CoaComponent,
  ],
  imports: [
    CommonModule,
    HalamanRoutingModule,
    FormsModule, ReactiveFormsModule,
    PrimekitModule,
    InfiniteScrollModule,
    ProdukModule,
    StrukturModule,
    PenggunaModule,
    NgSelectModule,
    CustomautofocusModule,
    GoogleMapsModule
  ],
  providers: [MessageService, ConfirmationService, ApiService]
})
export class HalamanModule { }
