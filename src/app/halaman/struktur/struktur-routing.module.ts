import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StrukturComponent } from './struktur.component';
import { Struktur1Component } from './struktur1/struktur1.component';
import { Struktur2Component } from './struktur2/struktur2.component';
import { Struktur3Component } from './struktur3/struktur3.component';

const routes: Routes = [
  {
    path: 'struktur',
    component: StrukturComponent
  },
  {
    path: 'struktur1',
    component: Struktur1Component
  },
  {
    path: 'struktur2',
    component: Struktur2Component
  },
  {
    path: 'struktur3',
    component: Struktur3Component
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StrukturRoutingModule { }
