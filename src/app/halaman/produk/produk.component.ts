import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';


const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-produk',
  templateUrl: './produk.component.html',
  styleUrls: ['./produk.component.scss']
})
export class ProdukComponent {
  @ViewChild('vsTable') vsTable:Table;
  @HostListener('window:keydown.control.q', ['$event'])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
    if (!this.popForm){
      this.openPop('', 1);
    }
    else {
      this.popForm = false;
    }
  }
  scrWidth:any;
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
    
  }

  //sesi
  sesiidakun: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;

  //data
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any = 1;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any = 0;
  formProduk: FormGroup;
  idproduk: any;

  //data kategori
  isidatakategori: any[] = [];
  totalkategori: any;
  totaltampilkategori: any;
  pagekategori: any;
  carikategori: any;
  collectionSizekategori: any;
  pageSizekategori: any;
  totalinputkategori: any;
  idkategori: any;
  kategori: any;
  kategoriText: any;

  //loading
  load: any[] = [];
  loading: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingSelect: boolean;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteData = false;
  InfiniteDatakategori = false;
  scrollTable: any;
  customMin = false;

  //form
  produk: any;
  kode: any;
  minimal: any = 1;
  harga: any;
  keterangan: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: Router,

  ) {}

  async ngOnInit() {
    this.getScreenSize();
    this.formProduk = this.fb.group({
      idkategori: ['', [Validators.required]],
      produk: ['', [Validators.required]],
      kode: ['', [Validators.required]],
      minimal: ['', [Validators.required]],
      harga: ['', [Validators.required]],
      keterangan: ['', [Validators.required]],
    });
    await this.loadStorage();
    const page_s = localStorage.getItem('pagingProduk')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_v.isi !== undefined){
      this.page = page_v.page;
      this.totalinput = 0;
      this.isidata = page_v.isi;
      this.cari = page_v.cari;
      this.listData();
      setTimeout(() => {
        document.getElementById(page_v.idproduk).scrollIntoView({
          block: "center",
          inline: "nearest"
          });
      }, 300, localStorage.setItem('pagingProduk', JSON.stringify({cari: page_v.cari, page: page_v.page})));
    }
    else {
      this.listData();
    }
  }

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidakun = sesivalue.sesiidakun;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;

    //paging
    const page_s = localStorage.getItem('pagingProduk')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_s !== '{}'){
      this.cari = page_v.cari;
    };
    localStorage.removeItem('pagingKategoriproduk');
    localStorage.removeItem('pagingKategorikatalog');
    localStorage.removeItem('pagingKatalog');
    localStorage.removeItem('pagingPengunjung');
    localStorage.removeItem('pagingCustom');
  }

  async listData(){
    this.api.setTitle();
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.page);
      param.append('cari', this.cari);
      param.append('totalinput', this.totalinput);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'produk/list', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loading = false;
          this.pageSukses = true;
          this.total = res.total;
          this.totaltampil = res.length
          if (this.page == 1){
            this.pageSize = 1;
            this.isidata = res.hasil;
          }
          else {
            if (this.isidata.length < res.total){
              for (let isi of res.hasil){
                this.isidata.push(isi);
              }
            }
          }
          if (this.page == this.collectionSize){
            this.InfiniteData = true;
          } 
          else {
            this.InfiniteData = false;
          }
        }
      }, ((err) => {
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.listData();
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(1, '');
        }
      }))
    })
  }

   async cekTambah(){
    this.loadingForm = true;
    return new Promise (() => {
      const cekmenu = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(cekmenu, 'produk/cek', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loadingForm = false;
        }
      }, (err) => {
        this.loadingForm = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.cekTambah();
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(2, '');
        }
      })
    })
  }

  async selectKategori(){
    this.loadingSelect = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pagekategori);
      param.append('cari', this.carikategori);
      param.append('totalinput', this.totalinputkategori);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'produk/select', {headers}).subscribe((res: any) => {
        this.collectionSizekategori = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 99){
          this.loadingSelect = false;
          this.totalkategori = res.total;
          this.pageSizekategori = res.totaldata;
          if (this.pagekategori == 1){
            this.pagekategori = 1;
            this.isidatakategori = res.hasil;
          }  
          else {
            if (this.isidatakategori.length < res.total){
              for (let isi of res.hasil){
                this.isidatakategori = [...this.isidatakategori, {idkategoriproduk: isi.idkategoriproduk, kategoriproduk: isi.kategoriproduk}];
              }
            }
          }
          if (this.pagekategori == this.collectionSizekategori){
            this.InfiniteDatakategori = true;
          } else {
            this.InfiniteDatakategori = false;
          }
        }
      }, ((err) => {
        this.loadingSelect = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectKategori();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(2, '');
        }
      }))
    })
  }

  async tambah(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formProduk.valid){
      this.loadingButton = false;
      return false
    } else {
      var produk: any = this.formProduk.value.produk;
      var kode: any = this.formProduk.value.kode;
      var minimal: any = this.formProduk.value.minimal;
      var harga: any = this.formProduk.value.harga;
      var keterangan: any = this.formProduk.value.keterangan;
      if (this.api.kataKasar(produk || kode || keterangan)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const param = new FormData();
        param.append('kategoriproduk', this.idkategori);
        param.append('produk', produk);
        param.append('kode', kode);
        param.append('minimal', minimal);
        param.append('harga', harga);
        param.append('keterangan', keterangan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'produk/tambah', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.popForm = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data kategori produk!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('pagingProduk')
            }
            this.page = 1;
            this.totalinput = 0;
            this.listData();
            document.getElementById('tabel').scrollTo(0, 0);
            this.InfiniteData = true;
          }
        }, (err) => {
          this.loadingButton = false;
          if (err.status == 401){
            this.api.error(err);
            setTimeout(() => {
              this.loadStorage();
              this.tambah();
            }, 300)
          } 
          else {
            this.api.error(err);
            this.gagalPost(3, '');
          }
        });
      })
    }
  }

  async dataList(id){
    this.loadingForm = true;
    return new Promise (() => {
      const dataPerbarui = new FormData();
      dataPerbarui.append('idproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'produk/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } 
        else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } 
        else if (res.status == 99) {
          this.loadingForm = false;
          this.produk = res.produk;
          this.kode = res.kode;
          this.minimal = res.minimal;
          this.harga = res.harga;
          this.keterangan = res.keterangan;
          this.isidatakategori = [{idkategoriproduk: res.idkategoriproduk, kategoriproduk: res.kategoriproduk}];
          this.kategori = res.idkategoriproduk;
          this.idkategori = res.idkategoriproduk;
          this.kategoriText = res.kategoriproduk;
        }
      }, (err) => {
        this.loadingForm = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.dataList(id);
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(4, '');
        }
      })
    })
  }

  async perbarui(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formProduk.valid){
      this.loadingButton = false;
      return false
    } else {
      var produk: any = this.formProduk.value.produk;
      var kode: any = this.formProduk.value.kode;
      var minimal: any = this.formProduk.value.minimal;
      var harga: any = this.formProduk.value.harga;
      var keterangan: any = this.formProduk.value.keterangan;
      if (this.api.kataKasar(produk || kode || keterangan)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idproduk',  this.idproduk);
        param.append('kategoriproduk', this.idkategori);
        param.append('produk', produk);
        param.append('kode', kode);
        param.append('minimal', minimal);
        param.append('harga', harga);
        param.append('keterangan', keterangan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'produk/perbarui', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } 
          else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
            this.popForm = false;
          }
          else if (res.status == 3) {
            this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'Periksa kembali data yang anda input!' });
            this.loadingButton = false;
          }
          else if (res.status == 99){
            this.loadingButton = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di kategori produk!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idproduk === this.idproduk);
            if (index !== -1) {
              this.isidata[index].produk = produk;
              this.isidata[index].kode = kode;
              this.isidata[index].minimal = minimal;
              this.isidata[index].harga = harga;
              this.isidata[index].keterangan = keterangan;
              if (this.kategori == this.idkategori){
                this.isidata[index].kategoriproduk = this.kategoriText;
              }
            }
          }
        }, (err) => {
          this.loadingButton = false;
          if (err.status == 401){
            this.api.error(err);
            setTimeout(() => {
              this.loadStorage();
              this.perbarui();
            }, 300)
          } 
          else {
            this.api.error(err);
            this.gagalPost(5, '');
          }
        })
      })
    }
  }

  async hapusData(id){
    return new Promise (async resolve => {
      const param = new FormData();
      param.append('idproduk',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'produk/hapus', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di produk!'});
          this.totalinput = 0;
          this.InfiniteData = true;
          this.listData();
          var index = this.isidata.findIndex(item => item.idproduk === id);
          if (index !== -1){
            this.isidata.splice(index, 1)
          }
        }
      }, (err) => {
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.hapusData(id);
          }, 300)
        } 
        else {
          this.api.error(err);
        }
      })
    })
  }

  async konfirmHapus(id, target){
    this.idproduk = id.idproduk;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.produk + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idproduk,
      accept: () => {
        this.hapusData(id.idproduk)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formProduk.get('idkategori').reset();
    this.formProduk.get('produk').reset();
    this.formProduk.get('kode').reset();
    this.formProduk.get('minimal').reset();
    this.formProduk.get('harga').reset();
    this.formProduk.get('keterangan').reset();
    this.kategoriText = undefined;
    this.minimal = 1;
  }

  //event

  async gagalPost(tipe, id) {
    var gagal = [{
      tipe: tipe,
      id: id,
    }];
    this.loadStorage();
    this.load = gagal;
    if (tipe == 1){
      this.pageGagal = true;
      this.pageSukses = false;
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5){
      this.formGagal = true
    }
  }

  async reload(param, id){
    if (param == 1) {
      this.pageGagal = false;
      this.listData();
    } else if (param == 2){
      this.formGagal = false
      this.cekTambah()
    } else if (param == 3){
      this.formGagal = false
      this.tambah()
    } else if (param == 4){
      this.formGagal = false
      this.dataList(this.idproduk)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Produk';
    } else if (p2 == 2){
      this.dataList(p1.idproduk)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Produk';
      this.idproduk = p1.idproduk;
    }
  }

  cariData(e){
    this.cari = e;
    if (this.cari === '' || undefined){
      this.cari = '';
      this.page = 1;
      this.totalinput = 0;
      this.listData();
      var dataPage = {
        cari: this.cari,
        scrl: this.scrollTable
      }
      localStorage.setItem('pagingProduk', JSON.stringify(dataPage));
    }
  }

  async emitsearch(){
    if (this.cari !== '' || undefined){
      this.page = 1;
      this.totalinput = 0;
      this.listData();
    }
    var dataPage = {
      cari: this.cari,
      scrl: this.scrollTable
    }
    localStorage.setItem('pagingProduk', JSON.stringify(dataPage));
  }

  onScroll(e){
    this.totalinput = this.total;
    setTimeout(() => {
      this.page = parseInt(this.page) + 1;
      this.listData();
    }, 500);
  }

  async gambarProduk(item){
    var dataPage = {
      cari: this.cari,
      scrl: this.scrollTable,
      isi: this.isidata,
      page: this.page,
      idproduk: item.idproduk
    }
    localStorage.setItem('pagingProduk', JSON.stringify(dataPage));
    const navigationExtras: NavigationExtras = {
    queryParams: {
      d: item.produk
    }};
    this.route.navigate(['produk/gambar-produk/' + item.idproduk], navigationExtras);
  }

  async customProduk(item){
    var dataPage = {
      cari: this.cari,
      scrl: this.scrollTable,
      isi: this.isidata,
      page: this.page,
      idproduk: item.idproduk
    }
    localStorage.setItem('pagingProduk', JSON.stringify(dataPage));
    const navigationExtras: NavigationExtras = {
    queryParams: {
      d: item.produk
    }};
    this.route.navigate(['produk/custom-produk/' + item.idproduk], navigationExtras)
  }

  //select event
  
  async openKategori(e){
    this.isidatakategori = [];
    this.pagekategori = 1;
    this.carikategori = "";
    this.selectKategori()
  }

  async onScrollingkategori(){
    this.pagekategori = parseInt(this.pagekategori) + 1;
    this.totalinputkategori = this.totalkategori;
    this.selectKategori();
  }

  async cariDatakategori(e){
    this.carikategori = e.term;
    this.pagekategori = 1;
    this.selectKategori()
  }

  async selectedKategori(e){
    this.idkategori = e.idkategoriproduk;
    this.kategoriText = e.kategoriproduk;
  }

}
