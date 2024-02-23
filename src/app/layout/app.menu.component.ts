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
          { label: 'User/Pengguna', icon: 'pi pi-fw pi-user', routerLink: ['/pengguna'] },
          { label: 'Kantor', icon: 'pi pi-fw pi-building', routerLink: ['/kantor'] },
          { label: 'Pekerjaan', icon: 'pi pi-fw pi-box', routerLink: ['/pekerjaan'] },
          { label: 'Jaminan', icon: 'pi pi-fw pi-shield', routerLink: ['/jaminan'] },
          { label: 'Golongan', icon: 'pi pi-fw pi-verified', routerLink: ['/golongan'] },
          { label: 'Gaji Layout', icon: 'pi pi-fw pi-money-bill', routerLink: ['/gaji-layout'] },
          { label: 'Header', icon: 'pi pi-fw pi-sun', routerLink: ['/header'] },
          { label: 'Struktur', icon: 'pi pi-fw pi-sitemap', items: [
            { label: 'Struktur 1',routerLink: ['/struktur1'] },
            { label: 'Struktur 2',routerLink: ['/struktur2'] },
            { label: 'Struktur 3',routerLink: ['/struktur3'] },
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
