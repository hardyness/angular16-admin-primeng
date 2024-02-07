import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProdukComponent } from './produk.component';
import { GambarProdukComponent } from './gambar-produk/gambar-produk.component';
import { CustomProdukComponent } from './custom-produk/custom-produk.component';

const routes: Routes = [
  {
    path: 'produk',
    component: ProdukComponent
  },
  {
    path: 'produk/gambar-produk/:idproduk',
    component: GambarProdukComponent
  },
  {
    path: 'produk/custom-produk/:idproduk',
    component: CustomProdukComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdukRoutingModule { }
