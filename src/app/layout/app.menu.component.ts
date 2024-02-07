import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];

  constructor(
    public layoutService: LayoutService,
    private router: Router
    ) { }

  ngOnInit() {
    this.model = [
      {
        label: 'NEW KBM',
        items: [
          { label: 'Kantor', icon: 'pi pi-fw pi-building', routerLink: ['/kantor'] },
          { label: 'Pekerjaan', icon: 'pi pi-fw pi-tablet', routerLink: ['/pekerjaan'] },
          { label: 'Jaminan', icon: 'pi pi-fw pi-key', routerLink: ['/jaminan'] },
          { label: 'Golongan', icon: 'pi pi-fw pi-verified', routerLink: ['/golongan'] },
          { label: 'Struktur', icon: 'pi pi-fw pi-directions', items: [
            { label: 'Struktur 1',routerLink: ['/'] },
            { label: 'Struktur 2',routerLink: ['/'] },
            { label: 'Struktur 3',routerLink: ['/'] },
          ]}
        ]
      },
      // {
      //   // label: 'Home',
      //   items: [
      //     { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }
      //   ]
      // },
      // {
      //   label: 'Data Produk',
      //   items: [
      //     { label: 'Kategori Produk', icon: 'pi pi-fw pi-table', routerLink: ['/kategori-produk']},
      //     { label: 'Produk', icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/produk']},
      //     { label: 'Kategori Katalog', icon: 'pi pi-fw pi-tags', routerLink: ['/kategori-katalog']},
      //     { label: 'Katalog', icon: 'pi pi-fw pi-inbox', routerLink: ['/katalog']},
      //   ]
      // },
      // {
      //   label: 'Data Website',
      //   items: [
      //     { label: 'SEO', icon: 'pi pi-fw pi-hashtag', routerLink: ['/seo'] },
      //     { label: 'Pengunjung', icon: 'pi pi-fw pi-eye', routerLink: ['/pengunjung'] },
      //     { label: 'Tentang Kami', icon: 'pi pi-fw pi-user', routerLink: ['/tentang-kami'] },
      //     { label: 'Kontak Kami', icon: 'pi pi-fw pi-globe', routerLink: ['/kontak'] },
      //   ]
      // },
    ];
  }

}
