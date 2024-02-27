import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimekitModule } from '../../services/primekit/primekit.module';

import { OtomatisRoutingModule } from './otomatis-routing.module';
import { OtomatisComponent } from './otomatis.component';
import { CustomautofocusModule } from 'src/app/services/customautofocus/customautofocus.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from 'src/app/services/api.service';
import { PemasukanComponent } from './pemasukan/pemasukan.component';
import { BungaTabunganComponent } from './bunga-tabungan/bunga-tabungan.component';
import { PajakBungaTabunganComponent } from './pajak-bunga-tabungan/pajak-bunga-tabungan.component';
import { BiayaAdminTabunganComponent } from './biaya-admin-tabungan/biaya-admin-tabungan.component';
import { BungaSimpananPokokComponent } from './bunga-simpanan-pokok/bunga-simpanan-pokok.component';
import { PajakBungaSimpananPokokComponent } from './pajak-bunga-simpanan-pokok/pajak-bunga-simpanan-pokok.component';
import { BungaSimpananWajibComponent } from './bunga-simpanan-wajib/bunga-simpanan-wajib.component';
import { PajakBungaSimpananWajibComponent } from './pajak-bunga-simpanan-wajib/pajak-bunga-simpanan-wajib.component';
import { SetoranPelunasanDipercepatComponent } from './setoran-pelunasan-dipercepat/setoran-pelunasan-dipercepat.component';
import { PengeluaranComponent } from './pengeluaran/pengeluaran.component';



@NgModule({
  declarations: [
    OtomatisComponent,
    PemasukanComponent,
    BungaTabunganComponent,
    PajakBungaTabunganComponent,
    BiayaAdminTabunganComponent,
    BungaSimpananPokokComponent,
    PajakBungaSimpananPokokComponent,
    BungaSimpananWajibComponent,
    PajakBungaSimpananWajibComponent,
    SetoranPelunasanDipercepatComponent,
    PengeluaranComponent
  ],
  imports: [
    CommonModule,
    OtomatisRoutingModule,
    FormsModule, ReactiveFormsModule,
    InfiniteScrollModule,
    NgSelectModule,
    PrimekitModule,
    CustomautofocusModule
  ],
  providers: [MessageService, ConfirmationService, ApiService]
})
export class OtomatisModule { }
