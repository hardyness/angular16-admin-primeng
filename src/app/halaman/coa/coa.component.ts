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
  selector: 'app-coa',
  templateUrl: './coa.component.html',
  styleUrls: ['./coa.component.scss']
})
export class CoaComponent {
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
  idsubheader: any;
  idcoa:any;

  //data select
  isidataselectheader: any[] = [];
  totalselectheader: any;
  totaltampilselectheader: any;
  pageselectheader: any;
  cariselectheader: any;
  collectionselectheader: any;
  pagesizeselectheader: any;
  totalinputselectheader: any = 0;
  idselectheader: any;
  selectheader: any;
  selectheadertext: any;

  isidataselectsubheader: any[] = [];
  totalselectsubheader: any;
  totaltampilselectsubheader: any;
  pageselectsubheader: any;
  cariselectsubheader: any;
  collectionselectsubheader: any;
  pagesizeselectsubheader: any;
  totalinputselectsubheader: any = 0;
  idselectsubheader: any;
  selectsubheader: any;
  selectsubheadertext: any;

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

  isidataselectrumus: any[] = [];
  totalselectrumus: any;
  totaltampilselectrumus: any;
  pageselectrumus: any;
  cariselectrumus: any;
  collectionselectrumus: any;
  pagesizeselectrumus: any;
  totalinputselectrumus: any = 0;
  idselectrumus: any;
  selectrumus: any;
  selectrumustext: any;

  isidataselectotomatis: any[] = [];
  totalselectotomatis: any;
  totaltampilselectotomatis: any;
  pageselectotomatis: any;
  cariselectotomatis: any;
  collectionselectotomatis: any;
  pagesizeselectotomatis: any;
  totalinputselectotomatis: any = 0;
  idselectotomatis: any;
  selectotomatis: any;
  selectotomatistext: any;

  isidataselectminus: any[] = [];
  totalselectminus: any;
  totaltampilselectminus: any;
  pageselectminus: any;
  cariselectminus: any;
  collectionselectminus: any;
  pagesizeselectminus: any;
  totalinputselectminus: any = 0;
  idselectminus: any;
  selectminus: any;
  selectminustext: any;

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
  InfiniteDataselectheader = false;
  InfiniteDataselectsubheader = false;
  InfiniteDataselectrumus = false;
  InfiniteDataselecturutan = false;
  scrollTable: any;
  subLayout: any;
  subHttp: any;

  //form 
  formCoa: FormGroup;
  formUrutan: FormGroup;
  namaSubheader: any;
  tipe: any;
  kodecoa: any;
  namaCoa: any;
  rumus: any;
  otomatis: any;
  minus: any;
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
    this.api.setHeader('Coa');
    this.getScreenSize();
    this.formCoa = this.fb.group({
      header: ['', [Validators.required]],
      subheader: ['', [Validators.required]],
      tipe: ['', [Validators.required]],
      kodecoa: ['', [Validators.required]],
      namaCoa: ['', [Validators.required]],
      rumus: ['', [Validators.required]],
      otomatis: ['', [Validators.required]],
      minus: ['', [Validators.required]],
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
      this.subHttp = this.api.postData(param, 'coa/list', {headers}).subscribe((res: any) => {
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
      this.subHttp = this.api.postData(cekmenu, 'coa/cek', {headers}).subscribe((res: any) => {
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

  async selectHeader(){
    this.loadingSelect = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pageselectheader);
      param.append('cari', this.cariselectheader);
      param.append('totalinput', this.totalinputselectheader);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'coa/selectheader', {headers}).subscribe((res: any) => {
        this.loadingSelect = false;
        this.collectionselectheader = Math.ceil(parseInt(res.total) / parseInt(res.length));
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
          this.totalselectheader = res.total;
          this.pagesizeselectheader = res.totaldata;
          if (this.pageselectheader == 1){
            this.pageselectheader = 1;
            this.isidataselectheader = res.hasil
          }
          else {
            if (this.isidataselectheader.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectheader = [...this.isidataselectheader, {header: isi.header}];
              }
            }
          }
          if (this.pageselectheader == this.collectionselectheader){
            this.InfiniteDataselectheader = true;
          } else {
            this.InfiniteDataselectheader = false;
          }
        }
      }, ((err) => {
        this.loadingSelect = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectHeader();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(6, '');
        }
      }))
    })
  }

  async selectSubheader(){
    this.loadingSelect = true;
    return new Promise (resolve => {
      const param = new FormData();
      if (this.idselectheader == undefined || this.idselectheader == null){
        param.append('header', this.idheader);
      }
      else {
        param.append('header', this.idselectheader);
      }
      param.append('halaman', this.pageselectsubheader);
      param.append('cari', this.cariselectsubheader);
      param.append('totalinput', this.totalinputselectsubheader);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'coa/selectsubheader', {headers}).subscribe((res: any) => {
        this.loadingSelect = false;
        this.collectionselectsubheader = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Anda tidak memiliki akses!'});
        }
        else if (res.status == 3){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Opps, silahkan hubungi operator!'});
          this.popForm = false;
        }
        else if (res.status == 99){
          this.totalselectsubheader = res.total;
          this.pagesizeselectsubheader = res.totaldata;
          if (this.pageselectsubheader == 1){
            this.pageselectsubheader = 1;
            this.isidataselectsubheader = res.hasil
          }
          else {
            if (this.isidataselectsubheader.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectsubheader = [...this.isidataselectsubheader, {subheader: isi.subheader}];
              }
            }
          }
          if (this.pageselectsubheader == this.collectionselectsubheader){
            this.InfiniteDataselectsubheader = true;
          } else {
            this.InfiniteDataselectsubheader = false;
          }
        }
      }, ((err) => {
        this.loadingSelect = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectHeader();
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
    if(!this.formCoa.valid){
      this.loadingButton = false;
      return false
    } else {
      var namacoa: any = this.formCoa.value.namaCoa.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var kodecoa: any = this.formCoa.value.kodecoa;
      if (this.api.kataKasar(namacoa)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const paramTambah = new FormData();
        if (this.idselectheader == undefined || this.idselectheader == null){
          paramTambah.append('idheader', this.idheader);
        }
        else {
          paramTambah.append('idheader', this.idselectheader);
        }
        if (this.idselectsubheader == undefined || this.idselectsubheader == null){
          paramTambah.append('idsubheader', this.idsubheader);
        }
        else {
          paramTambah.append('idsubheader', this.idselectsubheader);
        }
        if (this.idselecttipe == undefined || this.idselecttipe == null){
          paramTambah.append('tipe', this.tipe);
        }
        else {
          paramTambah.append('tipe', this.idselecttipe);
        }
        if (this.idselectrumus == undefined || this.idselectrumus == null){
          paramTambah.append('rumus', this.rumus);
        }
        else {
          paramTambah.append('rumus', this.idselectrumus);
        }
        if (this.idselectotomatis == undefined || this.idselectotomatis == null){
          paramTambah.append('otomatis', this.otomatis);
        }
        else {
          paramTambah.append('otomatis', this.idselectotomatis);
        }
        if (this.idselectminus == undefined || this.idselectminus == null){
          paramTambah.append('minus', this.minus);
        }
        else {
          paramTambah.append('minus', this.idselectminus);
        }
        paramTambah.append('coa', namacoa);
        paramTambah.append('kode', kodecoa);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramTambah, 'coa/tambah', {headers}).subscribe((res: any) => {
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

  async dataList(id1){
    this.loadingForm = true;
    return new Promise (() => {
      const dataPerbarui = new FormData();
      dataPerbarui.append('idcoa', id1);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'coa/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.isidataselectheader = [{idheader: res.idheader, header: res.headerteks}];
          this.isidataselectsubheader = [{idsubheader: res.idsubheader, subheader: res.subheaderteks}];
          this.isidataselecttipe = [{idtipe: res.tipe, tipe: res.tipeteks}];
          this.isidataselectrumus = [{idrumus: res.rumus, rumus: res.rumusteks}];
          this.isidataselectotomatis = [{idotomatis: res.otomatis, otomatis: res.otomatisteks}];
          this.isidataselectminus = [{idminus: res.minus, minus: res.minusteks}];
          this.idheader = res.idheader;
          this.idsubheader = res.idsubheader;
          this.tipe = res.tipe;
          this.rumus = res.rumus;
          this.otomatis = res.otomatis;
          this.minus = res.minus;
          this.kodecoa = res.kode;
          this.namaCoa = res.coa;
        }
      }, (err) => {
        this.loadingForm = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.dataList(id1);
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
    if(!this.formCoa.valid){
      this.loadingButton = false;
      return false
    } else {
      var namacoa: any = this.formCoa.value.namaCoa.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var kodecoa: any = this.formCoa.value.kodecoa;
      if (this.api.kataKasar(namacoa)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        if (this.idselectheader == undefined || this.idselectheader == null){
          paramPerbarui.append('idheader', this.idheader);
        }
        else {
          paramPerbarui.append('idheader', this.idselectheader);
        }
        if (this.idselectsubheader == undefined || this.idselectsubheader == null){
          paramPerbarui.append('idsubheader', this.idsubheader);
        }
        else {
          paramPerbarui.append('idsubheader', this.idselectsubheader);
        }
        if (this.idselecttipe == undefined || this.idselecttipe == null){
          paramPerbarui.append('tipe', this.tipe);
        }
        else {
          paramPerbarui.append('tipe', this.idselecttipe);
        }
        if (this.idselectrumus == undefined || this.idselectrumus == null){
          paramPerbarui.append('rumus', this.rumus);
        }
        else {
          paramPerbarui.append('rumus', this.idselectrumus);
        }
        if (this.idselectotomatis == undefined || this.idselectotomatis == null){
          paramPerbarui.append('otomatis', this.otomatis);
        }
        else {
          paramPerbarui.append('otomatis', this.idselectotomatis);
        }
        if (this.idselectminus == undefined || this.idselectminus == null){
          paramPerbarui.append('minus', this.minus);
        }
        else {
          paramPerbarui.append('minus', this.idselectminus);
        }
        paramPerbarui.append('idcoa', this.idcoa);
        paramPerbarui.append('coa', namacoa);
        paramPerbarui.append('kode', kodecoa);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramPerbarui, 'coa/perbarui', {headers}).subscribe((res: any) => {
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
            let index = this.isidata.findIndex(item => item.idcoa === this.idcoa);
            if (index !== -1) {
              if (this.selectheadertext !== undefined){
                this.isidata [index].headerteks = this.selectheadertext;
              }
              if (this.selectsubheadertext !== undefined){
                this.isidata [index].subheaderteks = this.selectsubheadertext;
              }
              if (this.selecttipetext !== undefined){
                this.isidata [index].tipeteks = this.selecttipetext;
              }
              if (this.selectrumustext !== undefined){
                this.isidata [index].rumusteks = this.selectrumustext;
              }
              if (this.selectotomatistext !== undefined){
                this.isidata [index].otomatisteks = this.selectotomatistext;
              }
              if (this.selectminustext !== undefined){
                this.isidata [index].minusteks = this.selectminustext;
              }
              this.isidata [index].coa = this.namaCoa;
              this.isidata [index].kode = this.kodecoa;
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
      dataPerbarui.append('idcoa', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'coa/dataurutan', {headers}).subscribe((res: any) => {
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
            this.dataUrutan(id);
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(4, '');
        }
      })
    })
  }

  async selectUrutan(){
    this.loadingSelect = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('idcoa', this.idcoa);
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
      this.subHttp = this.api.postData(param, 'coa/selecturutan', {headers}).subscribe((res: any) => {
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
        paramPerbarui.append('idcoa', this.idcoa);
        paramPerbarui.append('urutan', urutan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(paramPerbarui, 'coa/perbaruiurutan', {headers}).subscribe((res: any) => {
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
            let index = this.isidata.findIndex(item => item.idcoa === this.idcoa);
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
      paramHapus.append('idcoa',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(paramHapus, 'coa/hapus', {headers}).subscribe((res: any) => {
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
          var index = this.isidata.findIndex(item => item.idsubheader === id);
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
    this.idcoa = id.idcoa;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.coa + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idsubheader,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idcoa)
      },
      reject: () => {
      }
    });
  }


  //form
  async formKosong(){
    this.formCoa.get('header').reset();
    this.formCoa.get('subheader').reset();
    this.formCoa.get('tipe').reset();
    this.formCoa.get('namaCoa').reset();
    this.formCoa.get('kodecoa').reset();
    this.formCoa.get('otomatis').reset();
    this.formCoa.get('rumus').reset();
    this.formCoa.get('minus').reset();
    this.idselectheader = undefined;
    this.idselectsubheader = undefined;
    this.idselecttipe = undefined;
    this.idselectotomatis = undefined;
    this.idselectrumus = undefined;
    this.idselectminus = undefined;
  }

  //event

  async gagalPost(rumus, id) {
    var gagal = [{
      rumus: rumus,
      id: id,
    }];
    this.loadStorage();
    this.load = gagal;
    if (rumus == 1){
      this.pageGagal = true;
      this.pageSukses = false;
    } else if (rumus == 2 || rumus == 3 || rumus == 4 || rumus == 5){
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
      this.dataList(this.idcoa)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Subheader';
    } else if (p2 == 2){
      this.dataList(p1.idcoa);
      this.popForm = true;
      this.namaForm = 'Perbarui Data Subheader';
      this.idcoa = p1.idcoa;
      this.idheader = p1.idheader;
      this.idsubheader = p1.idsubheader;
    } else if (p2 == 3) {
      this.dataUrutan(p1.idcoa);
      this.popFormurutan = true;
      this.idcoa = p1.idcoa;
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

  ///// static selection

  //select Tipe
  async openTipe(e){
    this.isidataselecttipe= [{idtipe: 1, tipe: 'Debit'}, {idtipe: 2, tipe: 'Kredit'}];
  }

  async selectedtipe(e){
    if (e !== undefined){
      this.idselecttipe = e.idtipe;
      this.selecttipetext = e.tipe;
    }
  }

  //select Rumus
  async openRumus(e){
    this.isidataselectrumus = [{idrumus: 1, rumus: 'Tambah'}, {idrumus: 2, rumus: 'Kurang'}];
  }

  async selectedrumus(e){
    if (e !== undefined){
      this.idselectrumus = e.idrumus;
      this.selectrumustext = e.rumus;
    }
  }

  //select Otomatis
  async openOtomatis(e){
    this.isidataselectotomatis= [{idotomatis: 1, otomatis: 'Tanpa Otomatis'}, {idotomatis: 2, otomatis: 'Otomatis Laba Rugi'}];
  }

  async selectedotomatis(e){
    if (e !== undefined){
      this.idselectotomatis = e.idotomatis;
      this.selectotomatistext = e.otomatis;
    }
  }

   //select Minus
   async openMinus(e){
    this.isidataselectminus= [{idminus: 1, minus: 'Tidak'}, {idminus: 2, minus: 'Ya'}];
  }

  async selectedminus(e){
    if (e !== undefined){
      this.idselectminus = e.idminus;
      this.selectminustext = e.minus;
    }
  }

  ///// Dinamic selection

  //select Header
  async openHeader(e){
    this.isidataselectheader = [];
    this.pageselectheader = 1;
    this.cariselectheader = "";
    this.selectHeader();
  }

  
  async selectedheader(e){
    if (e !== undefined){
      this.idselectheader = e.idheader;
      this.selectheadertext = e.header;
    }
  }

  async onScrollingheader(){
    this.pageselectheader = parseInt(this.pageselectheader) + 1;
    this.totalinputselectheader = this.totalselectheader;
    this.selectHeader();
  }

  async cariDataheader(e){
    this.cariselectheader = e.term;
    this.pageselectheader = 1;
    this.selectHeader()
  }
  
  //select Subheader
  async openSubheader(e){
    this.isidataselectsubheader = [];
    this.pageselectsubheader = 1;
    this.cariselectsubheader = "";
    this.selectSubheader();
  }

  
  async selectedsubheader(e){
    if (e !== undefined){
      this.idselectsubheader = e.idsubheader;
      this.selectsubheadertext = e.subheader;
    }
  }

  async onScrollingsubheader(){
    this.pageselectsubheader = parseInt(this.pageselectsubheader) + 1;
    this.totalinputselectsubheader = this.totalselectsubheader;
    this.selectSubheader();
  }

  async cariDatasubheader(e){
    this.cariselectsubheader = e.term;
    this.pageselectsubheader = 1;
    this.selectSubheader()
  }

  //select urutan
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

  async clearselect(tipe){
    if (tipe == 1){
      this.idselectsubheader = undefined;
      this.formCoa.get('subheader').reset();
    }
  }
}
