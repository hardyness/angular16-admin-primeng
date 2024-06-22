import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';

import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { takeUntil } from 'rxjs';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-struktur2',
  templateUrl: './struktur2.component.html',
  styleUrls: ['./struktur2.component.scss']
})
export class Struktur2Component {
@ViewChild('vsTable') vsTable:Table;
  @HostListener('window:keydown.control.q', ['$event'])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
    if (this.pageSukses){
      if (!this.popForm){
        this.openPop('', 1);
      }
      else {
        this.popForm = false;
      }
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
  subrdata: any = true;
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any = 1;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any = 0;
  formStruktur2: FormGroup;
  namaStruktur2: any;
  idstruktur2: any;

  //data select
  isidataselectstruktur3: any[] = [];
  totalselectstruktur3: any;
  totaltampilselectstruktur3: any;
  pageselectstruktur3: any;
  cariselectstruktur3: any;
  collectionselectstruktur3: any;
  pagesizeselectstruktur3: any;
  totalinputselectstruktur3: any = 0;
  idselectstruktur3: any;
  selectstruktur3: any;
  selectstruktur3text: any;

  isidataselectstruktur2: any[] = [];
  totalselectstruktur2: any;
  totaltampilselectstruktur2: any;
  pageselectstruktur2: any;
  cariselectstruktur2: any;
  collectionselectstruktur2: any;
  pagesizeselectstruktur2: any;
  totalinputselectstruktur2: any = 0;
  idselectstruktur2: any;
  selectstruktur2: any;
  selectstruktur2text: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingSelect1: boolean;
  loadingSelect2: boolean;
  loadingSelect3: boolean;
  loadingHapus: any;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteData = false;
  InfiniteDataselectstruktur2 = false;
  InfiniteDataselectstruktur3 = false;
  scrollTable: any;
  subLayout: any;
  subHttp: any;

  //form
  bagihasil: any;
  tipe: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

    private layoutservice: LayoutService
  ) {}

  async ngOnInit() {
    this.api.setHeader('Struktur 2');
    this.getScreenSize();
    this.formStruktur2 = this.fb.group({
      struktur2: ['', [Validators.required]],
      struktur3: ['', [Validators.required]],
      bagihasil: ['', [Validators.required]],
    });
    await this.loadStorage()
    this.subLayout = this.layoutservice.emittersearch$.subscribe(data => {
      if (data !== ''){
        this.emitsearch(data)
      }
      else {
        const page_s = localStorage.getItem('search_history')  || '{}';
        const page_v = JSON.parse(page_s);
        if (page_s !== '{}'){
          this.cari = page_v.cari;
          if (this.cari === undefined){
            this.cari = '';
          }
        }
        else {
          this.cari = '';
        }
        this.page = 1;
        this.totalinput = 0;
        this.listData();
      }
    })
  }

  ngOnDestroy() {
    this.subLayout.unsubscribe();
    if (this.subHttp){
      this.subHttp.unsubscribe();
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
  }

  async listData(){
    this.loadingData = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.page);
      param.append('cari', this.cari);
      param.append('totalinput', this.totalinput);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'struktur2/list', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.api.setTitle();
          this.loadingData = false;
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
      })), takeUntil
    })
  }

  async cekTambah(){
    this.loadingForm = true;
    return new Promise (() => {
      const cekmenu = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(cekmenu, 'struktur2/cek', {headers}).subscribe((res: any) => {
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

  async selectStruktur3(){
    this.loadingSelect3 = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pageselectstruktur3);
      param.append('cari', this.cariselectstruktur3);
      param.append('totalinput', this.totalinputselectstruktur3);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'struktur2/selectstruktur3', {headers}).subscribe((res: any) => {
        this.loadingSelect3 = false;
        this.collectionselectstruktur3 = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Anda tidak memiliki akses!'});
          this.popForm = false;
        }
        else if (res.status == 3){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Opps, silahkan hubungi operator!'});
          this.popForm = false;
        }
        else if (res.status == 99){
          this.totalselectstruktur3 = res.total;
          this.pagesizeselectstruktur3 = res.totaldata;
          if (this.pageselectstruktur3 == 1){
            this.pageselectstruktur3 = 1;
            this.isidataselectstruktur3 = res.hasil;
          }
          else {
            if (this.isidataselectstruktur3.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectstruktur3 = [...this.isidataselectstruktur3, {idstruktur3: isi.idstruktur3, nama: isi.nama}];
              }
            }
          }
          if (this.pageselectstruktur3 == this.collectionselectstruktur3){
            this.InfiniteDataselectstruktur3 = true;
          } else {
            this.InfiniteDataselectstruktur3 = false;
          }
        }
      }, ((err) => {
        this.loadingSelect3 = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectStruktur3();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(6, '');
        }
      }))
    })
  }

  async selectStruktur2(){
    this.loadingSelect3 = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pageselectstruktur2);
      param.append('cari', this.cariselectstruktur2);
      param.append('totalinput', this.totalinputselectstruktur2);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'struktur2/selectstruktur2', {headers}).subscribe((res: any) => {
        this.loadingSelect3 = false;
        this.collectionselectstruktur2 = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Periksa kembali data yang ingin Anda akses!'});
        }
        else if (res.status == 3){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Opps, silahkan hubungi operator!'});
          this.popForm = false;
        }
        else if (res.status == 99){
          this.totalselectstruktur2 = res.total;
          this.pagesizeselectstruktur2 = res.totaldata;
          if (this.pageselectstruktur2 == 1){
            this.pageselectstruktur2 = 1;
            this.isidataselectstruktur2 = res.hasil;
          }
          else {
            if (this.isidataselectstruktur2.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectstruktur2 = [...this.isidataselectstruktur2, {struktur2: isi.struktur2, nama: isi.nama}];
              }
            }
          }
          if (this.pageselectstruktur2 == this.collectionselectstruktur2){
            this.InfiniteDataselectstruktur2 = true;
          } else {
            this.InfiniteDataselectstruktur2 = false;
          }
        }
      }, ((err) => {
        this.loadingSelect3 = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectStruktur2();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(6, '');
        }
      }))
    })
  }

  async tambah(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formStruktur2.valid){
      this.loadingButton = false;
      return false
    } else {
      var bagihasil: any = this.formStruktur2.value.bagihasil
      return new Promise (resolve => {
        const param = new FormData();
        param.append('struktur2', this.idselectstruktur2);
        param.append('struktur3', this.idselectstruktur3);
        param.append('bagihasil', bagihasil);
        param.append('tipe', '1');
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'struktur2/tambah', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 3){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.popForm = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data struktur2!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('paging_struktur2')
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
      dataPerbarui.append('idstruktur2', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'struktur2/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.isidataselectstruktur3 = [{idstruktur3: res.idstruktur3, nama: res.struktur3}];
          this.isidataselectstruktur2 = [{idstruktur2: res.idstruktur2, nama: res.struktur2}];
          this.idselectstruktur3 =  res.idstruktur3;
          this.idselectstruktur2 =  res.idstruktur2;
          this.bagihasil = res.bagihasil;
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
    if(!this.formStruktur2.valid){
      this.loadingButton = false;
      return false
    } else {
      
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idstruktur2',  this.idstruktur2);
        param.append('struktur3', this.idselectstruktur3);
        param.append('struktur2', this.idselectstruktur2);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'struktur2/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, cobalah ketik data yang lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di struktur2!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idstruktur2 === this.idstruktur2);
            if (index !== -1) {
              this.isidata[index].struktur3 = this.selectstruktur3text;
              this.isidata[index].struktur2 = this.selectstruktur2text;
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
    this.loadingHapus = id;
    return new Promise (async resolve => {
      const param = new FormData();
      param.append('idstruktur2',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'struktur2/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di struktur2!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idstruktur2 === id);
          if (index !== -1){
            this.isidata.splice(index, 1)
          }
        }
      }, (err) => {
        this.loadingHapus = false;
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
    this.idstruktur2 = id.idstruktur2;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.struktur2 + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idstruktur2,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idstruktur2)
      },
      reject: () => {
      }
    });
  }


  //form
  async formKosong(){
    this.formStruktur2.get('struktur2').reset();
    this.formStruktur2.get('struktur3').reset();
    this.formStruktur2.get('bagihasil').reset();
    this.idselectstruktur3 = '';
    this.idselectstruktur2 = '';
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
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5 || tipe == 6){
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
      this.dataList(this.idstruktur2)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    } else if (param == 6){
      this.formGagal = false
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Struktur 2';
    } else if (p2 == 2){
      this.dataList(p1.idstruktur2)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Struktur 2';
      this.idstruktur2 = p1.idstruktur2;
    }
  }

  async emitsearch(text){
    this.cari = text;
    this.page = 1;
    this.totalinput = 0;
    this.listData();
  }

  onScroll(e){
    this.totalinput = this.total;
    setTimeout(() => {
      this.page = parseInt(this.page) + 1;
      this.listData();
    }, 500);
  }

  //event select

  async openStruktur2(e){
    this.isidataselectstruktur2 = [];
    this.pageselectstruktur2 = 1;
    this.cariselectstruktur2 = "";
    this.selectStruktur2()
  }

  async onScrollingstruktur2(){
    this.pageselectstruktur2 = parseInt(this.pageselectstruktur2) + 1;
    this.totalinputselectstruktur2 = this.totalselectstruktur2;
    this.selectStruktur2();
  }

  async cariDatastruktur2(e){
    this.cariselectstruktur2 = e.term;
    this.pageselectstruktur2 = 1;
    this.selectStruktur2()
  }

  async selectedstruktur2(e){
    if (e !== undefined){
      this.idselectstruktur2 = e.idstruktur2;
      this.selectstruktur2text = e.nama;
    }
    console.log(e)
  }

  //

  async openStruktur3(e){
    this.isidataselectstruktur3 = [];
    this.pageselectstruktur3 = 1;
    this.cariselectstruktur3 = "";
    this.selectStruktur3();
  }

  async onScrollingstruktur3(){
    this.pageselectstruktur3 = parseInt(this.pageselectstruktur3) + 1;
    this.totalinputselectstruktur3 = this.totalselectstruktur3;
    this.selectStruktur3();
  }

  async cariDatastruktur3(e){
    this.cariselectstruktur3 = e.term;
    this.pageselectstruktur3 = 1;
    this.selectStruktur3()
  }

  async selectedstruktur3(e){
    if (e !== undefined){
      this.idselectstruktur3 = e.idstruktur3;
      this.selectstruktur3text = e.nama;
    }
    console.log(e)
  }

  async clearselect(tipe){
    if (tipe == 1){
      this.idselectstruktur3 = '';
      this.formStruktur2.get('struktur2').reset();
    }
    else if (tipe == 3){
      this.idselectstruktur2 = '';
    }
  }
}
