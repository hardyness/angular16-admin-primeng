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
          { label: 'Gaji Layout', icon: 'pi pi-fw pi-money-bill', routerLink: ['/gaji-layout'] },
          { label: 'Office', icon: 'pi pi-fw pi-building', items: [
            { label: 'Daftar Kantor', routerLink: ['/kantor'] },
            { label: 'Area', routerLink: ['/area'] },
          ]},
          { label: 'Referensi', icon: 'pi pi-fw pi-book', items: [
            { label: 'Tipe Pembiayaan', routerLink: ['/tipe-pembiayaan'] },
            { label: 'Jaminan', routerLink: ['/jaminan'] },
            { label: 'Golongan', routerLink: ['/golongan'] },
            { label: 'Pekerjaan', routerLink: ['/pekerjaan'] },
          ]},
          { label: 'Struktur', icon: 'pi pi-fw pi-sitemap', items: [
            { label: 'Struktur 1',routerLink: ['/struktur1'] },
            { label: 'Struktur 2',routerLink: ['/struktur2'] },
            { label: 'Struktur 3',routerLink: ['/struktur3'] },
          ]},
          { label: 'Finance', icon: 'pi pi-fw pi-credit-card', items: [
            { label: 'Header', routerLink: ['/header'] },
            { label: 'Subheader', routerLink: ['/subheader'] },
            { label: 'Coa', routerLink: ['/coa'] },
          ]},
          { label: 'Otomatis', icon: 'pi pi-fw pi-play', items: [
            { label: 'Pemasukan',routerLink: ['/otomatispemasukan'] },
            { label: 'Pengeluaran',routerLink: ['/otomatispengeluaran'] },
            { label: 'Bunga Tabungan',routerLink: ['/otomatisbungatabungan'] },
            { label: 'Pajak Bunga Tabungan',routerLink: ['/otomatispajakbungatabungan'] },
            { label: 'Biaya Admin Tabungan',routerLink: ['/otomatisbiayaadmintabungan'] },
            { label: 'Bunga Simpanan Pokok',routerLink: ['/otomatisbungasimpananpokok'] },
            { label: 'Pajak Bunga Simpanan Pokok',routerLink: ['/otomatispajakbungasimpananpokok'] },
            { label: 'Bunga Simpanan Wajib',routerLink: ['/otomatisbungasimpananwajib'] },
            { label: 'Pajak Bunga Simpanan Wajib',routerLink: ['/otomatispajakbungasimpananwajib'] },
            { label: 'Setoran Pelunasan Dipercepat',routerLink: ['/otomatissetoranpelunasandipercepat'] },
          ]},
          // { label: 'Tipe Pembiayaan', icon: 'pi pi-fw pi-wallet', routerLink: ['/tipe-pembiayaan'] },
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
