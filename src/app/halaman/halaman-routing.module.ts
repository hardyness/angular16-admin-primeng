import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HalamanComponent } from './halaman.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProdukComponent } from './produk/produk.component';
import { KatalogComponent } from './katalog/katalog.component';
import { TentangKamiComponent } from './tentang-kami/tentang-kami.component';
import { SeoComponent } from './seo/seo.component';
import { PengunjungComponent } from './pengunjung/pengunjung.component';
import { KontakComponent } from './kontak/kontak.component';
import { KantorComponent } from './kantor/kantor.component';
import { PekerjaanComponent } from './pekerjaan/pekerjaan.component';
import { JaminanComponent } from './jaminan/jaminan.component';
import { GolonganComponent } from './golongan/golongan.component';
import { PenggunaComponent } from './pengguna/pengguna.component';
import { GajiLayoutComponent } from './gaji-layout/gaji-layout.component';
import { HeaderComponent } from './header/header.component';
import { TipepembiayaanComponent } from './tipepembiayaan/tipepembiayaan.component';
import { AreaComponent } from './area/area.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component: HalamanComponent,
  // },
  {
    path: 'golongan',
    component: GolonganComponent,
  },
  {
    path: 'jaminan',
    component: JaminanComponent,
  },
  {
    path: 'kantor',
    component: KantorComponent,
  },
  {
    path: 'pekerjaan',
    component: PekerjaanComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'katalog',
    component: KatalogComponent
  },
  {
    path: 'tentang-kami',
    component: TentangKamiComponent
  },
  {
    path: 'seo',
    component: SeoComponent 
  },
  {
    path: 'pengunjung',
    component: PengunjungComponent 
  },
  {
    path: 'kontak',
    component: KontakComponent 
  },
  {
    path: 'pengguna',
    component: PenggunaComponent,
  },
  {
    path: 'gaji-layout',
    component: GajiLayoutComponent,
  },
  {
    path: 'header',
    component: HeaderComponent,
  },
  {
    path: 'tipe-pembiayaan',
    component: TipepembiayaanComponent,
  },
  {
    path: 'area',
    component: AreaComponent,
  },
  {
    path: '',
    redirectTo: '/kantor',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HalamanRoutingModule { }
