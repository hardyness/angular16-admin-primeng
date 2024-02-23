import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PenggunaComponent } from './pengguna.component';
import { AksesLevelPenggunaComponent } from './akses-level-pengguna/akses-level-pengguna.component';

const routes: Routes = [
  {
    path: 'pengguna/akses-level-pengguna/:idlogin',
    component: AksesLevelPenggunaComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PenggunaRoutingModule { }
