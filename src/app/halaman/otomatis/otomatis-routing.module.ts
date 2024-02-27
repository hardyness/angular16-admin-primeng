import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PemasukanComponent } from './pemasukan/pemasukan.component';
import { OtomatisComponent } from './otomatis.component';
import { BungaTabunganComponent } from './bunga-tabungan/bunga-tabungan.component';
import { PajakBungaTabunganComponent } from './pajak-bunga-tabungan/pajak-bunga-tabungan.component';
import { BiayaAdminTabunganComponent } from './biaya-admin-tabungan/biaya-admin-tabungan.component';
import { BungaSimpananPokokComponent } from './bunga-simpanan-pokok/bunga-simpanan-pokok.component';
import { PajakBungaSimpananPokokComponent } from './pajak-bunga-simpanan-pokok/pajak-bunga-simpanan-pokok.component';
import { BungaSimpananWajibComponent } from './bunga-simpanan-wajib/bunga-simpanan-wajib.component';
import { PajakBungaSimpananWajibComponent } from './pajak-bunga-simpanan-wajib/pajak-bunga-simpanan-wajib.component';
import { SetoranPelunasanDipercepatComponent } from './setoran-pelunasan-dipercepat/setoran-pelunasan-dipercepat.component';
import { PengeluaranComponent } from './pengeluaran/pengeluaran.component';

const routes: Routes = [
  {
    path: 'otomatis',
    component: OtomatisComponent
  },
  {
    path: 'otomatispemasukan',
    component: PemasukanComponent
  },
  {
    path: 'otomatispengeluaran',
    component: PengeluaranComponent
  },
  {
    path: 'otomatisbungatabungan',
    component: BungaTabunganComponent
  },
  {
    path: 'otomatispajakbungatabungan',
    component: PajakBungaTabunganComponent
  },
  {
    path: 'otomatisbiayaadmintabungan',
    component: BiayaAdminTabunganComponent
  },
  {
    path: 'otomatisbungasimpananpokok',
    component: BungaSimpananPokokComponent
  },
  {
    path: 'otomatispajakbungasimpananpokok',
    component: PajakBungaSimpananPokokComponent
  },
  {
    path: 'otomatisbungasimpananwajib',
    component: BungaSimpananWajibComponent
  },
  {
    path: 'otomatispajakbungasimpananwajib',
    component: PajakBungaSimpananWajibComponent
  },
  {
    path: 'otomatissetoranpelunasandipercepat',
    component: SetoranPelunasanDipercepatComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtomatisRoutingModule { }
