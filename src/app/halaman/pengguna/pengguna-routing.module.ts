import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PenggunaComponent } from './pengguna.component';
import { AksesLevelPenggunaComponent } from './akses-level-pengguna/akses-level-pengguna.component';
import { GajiSinkComponent } from './gaji-sink/gaji-sink.component';

const routes: Routes = [
  {
    path: 'pengguna/akses-level-pengguna/:idpengguna',
    component: AksesLevelPenggunaComponent
  },
  {
    path: 'pengguna/gaji-sink/:idpengguna',
    component: GajiSinkComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PenggunaRoutingModule { }
