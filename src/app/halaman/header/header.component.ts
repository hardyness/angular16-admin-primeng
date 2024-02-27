import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { ExcelService } from 'src/app/services/excel.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

const sesilogin = 'masterkbmv4_login';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('vsTable') vsTable:Table;
  @HostListener('window:keydown.control.q', ['$event'])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
    if (this.pageSukses && !this.popFormurutan){
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
  sesiidlogin: any;
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
  idheader: any;

  //data select
  isidataselecttipe: any[] = [];
  totalselecttipe: any;
  totaltampilselecttipe: any;
  pageselecttipe: any;
  cariselecttipe: any;
  collectionselecttipe: any;
  pagesizeselecttipe: any;
  totalinputselecttipe: any = 0;
  idselecttipe: any;
  selecttipe: any;
  selecttipetext: any;

  isidataselecturutan: any[] = [];
  totalselecturutan: any;
  totaltampilselecturutan: any;
  pageselecturutan: any;
  cariselecturutan: any;
  collectionselecturutan: any;
  pagesizeselecturutan: any;
  totalinputselecturutan: any = 0;
  idselecturutan: any;
  selecturutan: any;
  selecturutantext: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingFormurutan = false;
  loadingButton: boolean;
  loadingHapus: any;
  loadingSelect: boolean;

  //event
  popForm: boolean = false;
  popFormurutan: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteData = false;
  InfiniteDataselecttipe = false;
  InfiniteDataselecturutan = false;
  scrollTable: any;
  subLayout: any;
  subHttp: any;

  //form 
  formHeader: FormGroup;
  formUrutan: FormGroup;
  namaHeader: any;
  tipe:any;
  rumus: any;
  urutan: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private excel: ExcelService,
    private layoutservice: LayoutService
  ) {}

  async ngOnInit() {
    this.api.setHeader('Header');
    this.getScreenSize();
    this.formHeader = this.fb.group({
      tipe: ['', [Validators.required]],
      namaHeader: ['', [Validators.required]],
      rumus: ['', [Validators.required]],
    });
    this.formUrutan = this.fb.group({
      urutan: ['', [Validators.required]]
    })
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
    this.sesiidlogin = sesivalue.sesiidlogin;
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
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'header/list', {headers}).subscribe((res: any) => {
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
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(cekmenu, 'header/cek', {headers}).subscribe((res: any) => {
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

  async selectUrutan(){
    this.loadingSelect = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('idheader', this.idheader);
      param.append('halaman', this.pageselecturutan);
      param.append('cari', this.cariselecturutan);
      param.append('totalinput', this.totalinputselecturutan);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'header/selecturutan', {headers}).subscribe((res: any) => {
        this.loadingSelect = false;
        this.collectionselecturutan = Math.ceil(parseInt(res.total) / parseInt(res.length));
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
          this.totalselecturutan = res.total;
          this.pagesizeselecturutan = res.totaldata;
          if (this.pageselecturutan == 1){
            this.pageselecturutan = 1;
            this.isidataselecturutan = res.hasil
          }
          else {
            if (this.isidataselecturutan.length < res.total){
              for (let isi of res.hasil){
                this.isidataselecturutan = [...this.isidataselecturutan, {urutan: isi.urutan}];
              }
            }
          }
          if (this.pageselecturutan == this.collectionselecturutan){
            this.InfiniteDataselecturutan = true;
          } else {
            this.InfiniteDataselecturutan = false;
          }
        }
      }, ((err) => {
        this.loadingSelect = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectUrutan();
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
    if(!this.formHeader.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaHeader: any = this.formHeader.value.namaHeader.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var rumus: any = this.formHeader.value.rumus;
      if (this.api.kataKasar(namaHeader)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const paramTambah = new FormData();
        paramTambah.append('tipe', this.idselecttipe);
        paramTambah.append('header', namaHeader);
        paramTambah.append('rumus', rumus);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramTambah, 'header/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data header!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('paging_header')
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
      dataPerbarui.append('idheader', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'header/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          var tipetext: any;
          if (res.tipe == 1){
            tipetext = 'Neraca'
          } else {
            tipetext = 'Laba Rugi'
          }
          this.isidataselecttipe = [{idtipe: res.tipe, tipe: tipetext}];
          this.tipe = res.tipe; 
          this.namaHeader = res.header;
          this.rumus = res.rumus;
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
    if(!this.formHeader.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaHeader: any = this.formHeader.value.namaHeader.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var rumus: any = this.formHeader.value.rumus;
      if (this.api.kataKasar(namaHeader)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        paramPerbarui.append('idheader',  this.idheader);
        paramPerbarui.append('header', namaHeader);
        paramPerbarui.append('rumus', rumus);
        if (this.idselecttipe == undefined || this.idselecttipe == null){
          paramPerbarui.append('tipe', this.tipe);
        }
        else {
          paramPerbarui.append('tipe', this.idselecttipe);
        }

        console.log(this.idselecttipe);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramPerbarui, 'header/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di header!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idheader === this.idheader);
            if (index !== -1) {
              this.isidata [index].header = namaHeader;
              this.isidata [index].rumus = rumus;
              this.isidata [index].tipe = this.selecttipetext;
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

  async dataUrutan(id){
    this.loadingFormurutan = true;
    return new Promise (() => {
      const dataPerbarui = new FormData();
      dataPerbarui.append('idheader', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'header/dataurutan', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingFormurutan = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingFormurutan = false;
          this.isidataselecturutan = [{idurutan: res.urutan, urutan: res.urutan}];
          this.urutan = res.urutan;
        }
      }, (err) => {
        this.loadingFormurutan = false;
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

  async perbaruiUrutan(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formUrutan.valid){
      this.loadingButton = false;
      return false
    } else {
      var urutan: any = this.formUrutan.value.urutan;
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        paramPerbarui.append('idheader', this.idheader);
        paramPerbarui.append('urutan', urutan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramPerbarui, 'header/perbaruiurutan', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
            this.popFormurutan = false;
          } else if (res.status == 3){
            this.loadingButton = false;
            this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, cobalah ketik data yang lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di header!'});
            this.popFormurutan = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idheader === this.idheader);
            if (index !== -1) {
              this.isidata [index].urutan = urutan;
            }
          }
        }, (err) => {
          this.loadingButton = false;
          if (err.status == 401){
            this.api.error(err);
            setTimeout(() => {
              this.loadStorage();
              this.perbaruiUrutan();
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
      const paramHapus = new FormData();
      paramHapus.append('idheader',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(paramHapus, 'header/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di header!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idheader === id);
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
    this.idheader = id.idheader;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.header + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idheader,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idheader)
      },
      reject: () => {
      }
    });
  }


  //form
  async formKosong(){
    this.formHeader.get('namaHeader').reset();
    this.formHeader.get('rumus').reset();
    this.formHeader.get('tipe').reset();
    this.idselecttipe = undefined;
    this.idselecturutan = undefined;
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
      this.dataList(this.idheader)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Header';
    } else if (p2 == 2){
      this.dataList(p1.idheader)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Header';
      this.idheader = p1.idheader;
    } else if (p2 == 3) {
      this.dataUrutan(p1.idheader);
      this.popFormurutan = true;
      this.idheader = p1.idheader;
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

  async downloadexcel(){
    var header = ['Id header',  'Header']
    this.excel.generateExcel('Data header', 'header', header, this.isidata)
  }

  //

  async openTipe(e){
    this.isidataselecttipe = [{idtipe: 1, tipe: 'Neraca'}, {idtipe: 2, tipe: 'Laba Rugi'}];
  }

  async selectedtipe(e){
    if (e !== undefined){
      this.idselecttipe = e.idtipe;
      this.selecttipetext = e.tipe;
    }
  }

  async clearselect(tipe){
    console.log(tipe);
  }

  
  async openUrutan(e){
    this.isidataselecturutan = [];
    this.pageselecturutan = 1;
    this.cariselecturutan = "";
    this.selectUrutan();
  }

  
  async selectedurutan(e){
    if (e !== undefined){
      this.idselecturutan = e.urutan;
      this.selecturutantext = e.urutan;
    }
    console.log(e)
  }

  async onScrollingurutan(){
    this.pageselecturutan = parseInt(this.pageselecturutan) + 1;
    this.totalinputselecturutan = this.totalselecturutan;
    this.selectUrutan();
  }

  async cariDataurutan(e){
    this.cariselecturutan = e.term;
    this.pageselecturutan = 1;
    this.selectUrutan()
  }
}
