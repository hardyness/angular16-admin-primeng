import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-custom-produk',
  templateUrl: './custom-produk.component.html',
  styleUrls: ['./custom-produk.component.scss']
})
export class CustomProdukComponent {
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
  url: any;

  //data
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any = 1;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any = 0;
  formCustom: FormGroup;
  namaCustom: any;
  idkategori: any;
  idproduk: any;
  namaproduk: any;
  idcustomproduk: any;

  //loading
  load: any[] = [];
  loading: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteData = false;
  scrollTable: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public actRoute: ActivatedRoute,
    public route: Router
  ) {}

  async ngOnInit() {
    this.getScreenSize();
    this.formCustom = this.fb.group({
      namaCustom: ['', [Validators.required]],
    });
    await this.loadStorage();
    this.idproduk = this.actRoute.snapshot.paramMap.get('idproduk');
    this.namaproduk = this.actRoute.snapshot.queryParamMap.get('d');
    const page_s = localStorage.getItem('pagingCustom')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_v.isi !== undefined){
      this.page = page_v.page;
      this.totalinput = 0;
      this.isidata = page_v.isi;
      this.cari = page_v.cari;
      this.listData();
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
    const page_s = localStorage.getItem('pagingCustom')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_s !== '{}'){
      this.cari = page_v.cari;
    }
  }

  async listData(){
    this.api.setCustomtitle('Kostumisasi Produk ' + this.namaproduk);
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('idproduk', this.idproduk);
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
      this.api.postData(param, 'produk/customproduk/list', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'coba periksa kembali data yang anda akses!'});
          setTimeout(() => {
            this.kembali();
          }, 500);
        } else if (res.status == 99){
          this.loading = false;
          this.pageSukses = true;
          this.total = res.total;
          this.totaltampil = res.length
          if (this.page == 1){
            this.pageSize = 1;
            this.isidata = res.hasil;
          } else {
            if (this.isidata.length < res.total){
              for (let isi of res.hasil){
                this.isidata.push(isi);
              }
            }
          }
          if (this.page == this.collectionSize){
            this.InfiniteData = true;
          } else {
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


  async tambah(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formCustom.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaCustom: any = this.formCustom.value.namaCustom;
      if (this.api.kataKasar(namaCustom)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const param = new FormData();
        param.append('idproduk', this.idproduk);
        param.append('customproduk', namaCustom);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'produk/customproduk/tambah', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Periksa kembali data yang ingin anda akses'});
          } else if (res.status == 3){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.popForm = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data kategori produk!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('pagingCustom')
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
      dataPerbarui.append('idproduk', this.idproduk);
      dataPerbarui.append('idcustomproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'produk/customproduk/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.namaCustom = res.customproduk;
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
    if(!this.formCustom.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaCustom: any = this.formCustom.value.namaCustom;
      if (this.api.kataKasar(namaCustom)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idproduk',  this.idproduk);
        param.append('idcustomproduk', this.idcustomproduk);
        param.append('customproduk', namaCustom);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'produk/customproduk/perbarui', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
            this.popForm = false;
          } else if (res.status == 3){
            this.loadingButton = false;
            this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, cobalah ketik custom produk lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di custom produk!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idproduk === this.idproduk);
            if (index !== -1) {
              this.isidata[index].customProduk = namaCustom;
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
      const paramcustom = new FormData();
      paramcustom.append('idproduk', this.idproduk);
      paramcustom.append('idcustomproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramcustom, 'produk/customproduk/hapus', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di custom produk!'});
          this.totalinput = 0;
          this.InfiniteData = true;
          this.listData();
          var index = this.isidata.findIndex(item => item.idcustomproduk === id);
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
    this.idcustomproduk = id.idcustomproduk;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.customproduk + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idcustomproduk,
      accept: () => {
        this.hapusData(id.idcustomproduk)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formCustom.get('namaCustom').reset();
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
    } else if (param == 3){
      this.formGagal = false
      this.tambah()
    } else if (param == 4){
      this.formGagal = false
      this.dataList(this.idcustomproduk)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.popForm = true;
      this.namaForm = 'Tambah Custom Produk';
    } else if (p2 == 2){
      this.dataList(p1.idcustomproduk)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Custom Produk';
      this.idcustomproduk = p1.idcustomproduk;
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
      localStorage.setItem('pagingCustom', JSON.stringify(dataPage));
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
    localStorage.setItem('pagingCustom', JSON.stringify(dataPage));
  }

  onScroll(e){
    this.totalinput = this.total;
    setTimeout(() => {
      this.page = parseInt(this.page) + 1;
      this.listData();
    }, 500);
  }

  kembali(){
    localStorage.removeItem('pagingCustom');
    this.route.navigateByUrl('produk')
  }
}
