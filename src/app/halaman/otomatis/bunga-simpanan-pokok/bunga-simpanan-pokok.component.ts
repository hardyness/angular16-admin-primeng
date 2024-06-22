import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { HttpHeaders } from '@angular/common/http';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-bunga-simpanan-pokok',
  templateUrl: './bunga-simpanan-pokok.component.html',
  styleUrls: ['./bunga-simpanan-pokok.component.scss']
})
export class BungaSimpananPokokComponent {
  @HostListener('window:keydown.control.q', ['$event'])
  bukaDialog(event: KeyboardEvent) {
    event.preventDefault();
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
  formTambahDebit: FormGroup;
  formTambahKredit: FormGroup;
  debit: any;
  kredit: any;
  iddebit: any;

  //data select kredit
  isidataselectkredit: any[] = [];
  totalselectkredit: any;
  totaltampilselectkredit: any;
  pageselectkredit: any;
  cariselectkredit: any;
  collectionselectkredit: any;
  pagesizeselectkredit: any;
  totalinputselectkredit: any = 0;
  idselectkredit: any;
  selectkredit: any;
  selectkredittext: any;

  // data select debit
  isidataselectdebit: any[] = [];
  totalselectdebit: any;
  totaltampilselectdebit: any;
  pageselectdebit: any;
  cariselectdebit: any;
  collectionselectdebit: any;
  pagesizeselectdebit: any;
  totalinputselectdebit: any = 0;
  idselectdebit: any;
  selectdebit: any;
  selectdebittext: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingDebit: boolean;
  loadingKredit: boolean;

  hasildatakredit: any;
  hasildatadebit: any;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteDataselectdebit = false;
  InfiniteDataselectkredit = false;
  subHttp: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {}

  async ngOnInit() {
    this.getScreenSize();
    this.formTambahDebit = this.fb.group({
      dataTambahDebit: ['', [Validators.required]],
    });
    this.formTambahKredit = this.fb.group({
      dataTambahKredit: ['', [Validators.required]],
    });
    await this.loadStorage()
    this.listData()
  }

  ngOnDestroy() {
    localStorage.removeItem('schstatus');
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
    localStorage.setItem('schstatus', '1');
  }

  async listData(){
    this.loadingData = true;
    return new Promise (resolve => {
      const param = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'simpananpokok/list', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.api.setTitle();
          this.loadingData = false;
          this.pageSukses = true;
          this.isidataselectdebit = [{iddebit: res.hasildatadebit[0].debit, debit: res.hasildatadebit[0].debit}];
          this.isidataselectkredit = [{idkredit: res.hasildatakredit[0].kredit, kredit: res.hasildatakredit[0].kredit}];
          this.idselectdebit =  res.hasildatadebit[0].debit;
          this.idselectkredit =  res.hasildatakredit[0].kredit;
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
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(cekmenu, 'simpananpokok/cek', {headers}).subscribe((res: any) => {
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

  async selectDebit(){
    this.loadingDebit = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pageselectdebit);
      param.append('cari', this.cariselectdebit);
      param.append('totalinput', this.totalinputselectdebit);
      param.append('iddebit ', this.idselectdebit);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'simpananpokok/selectdebitsimpananpokok', {headers}).subscribe((res: any) => {
        this.loadingDebit = false;
        this.collectionselectdebit = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Periksa kembali data yang ingin Anda akses!'});
        }
        else if (res.status == 99){
          this.totalselectdebit = res.total;
          this.pagesizeselectdebit = res.totaldata;
          if (this.pageselectdebit == 1){
            this.pageselectdebit = 1;
            this.isidataselectdebit = res.hasil;
          }
          else {
            if (this.isidataselectdebit.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectdebit = [...this.isidataselectdebit, {iddebit: isi.iddebit, kredit: isi.kredit}];
              }
            }
          }
          if (this.pageselectdebit == this.collectionselectdebit){
            this.InfiniteDataselectdebit = true;
          } else {
            this.InfiniteDataselectdebit = false;
          }
        }
      }, ((err) => {
        this.loadingDebit = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectDebit();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(3, '');
        }
      }))
    })
  }

  async selectKredit(){
    this.loadingKredit = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.pageselectkredit);
      param.append('cari', this.cariselectkredit);
      param.append('totalinput', this.totalinputselectkredit);
      param.append('idkredit ', this.idselectkredit);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'simpananpokok/selectkreditsimpananpokok', {headers}).subscribe((res: any) => {
        this.loadingKredit = false;
        this.collectionselectkredit = Math.ceil(parseInt(res.total) / parseInt(res.length));
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
          this.totalselectkredit = res.total;
          this.pagesizeselectkredit = res.totaldata;
          if (this.pageselectkredit == 1){
            this.pageselectkredit = 1;
            this.isidataselectkredit = res.hasil;
          }
          else {
            if (this.isidataselectkredit.length < res.total){
              for (let isi of res.hasil){
                this.isidataselectkredit = [...this.isidataselectkredit, {idkredit: isi.idkredit, kredit: isi.kredit}];
              }
            }
          }
          if (this.pageselectkredit == this.collectionselectkredit){
            this.InfiniteDataselectkredit = true;
          } else {
            this.InfiniteDataselectkredit = false;
          }
        }
      }, ((err) => {
        this.loadingKredit = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.selectKredit();
          }, 300)
        }
        else {
          this.api.error(err);
          this.gagalPost(5, '');
        }
      }))
    })
  }

  async tambahDebit(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formTambahDebit.valid){
      this.formGagal = true;
      this.loadingButton = false;
      return false
    } else {
      return new Promise (resolve => {
        const param = new FormData();
        param.append('iddebit', this.idselectdebit);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'simpananpokok/tambahdebitsimpananpokok', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.listData();
          }
        }, (err) => {
          this.loadingButton = false;
          if (err.status == 401){
            this.api.error(err);
            setTimeout(() => {
              this.loadStorage();
              this.tambahDebit();
            }, 300)
          } 
          else {
            this.api.error(err);
            this.gagalPost(4, '');
          }
        });
      })
    }
  }

  async tambahKredit(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formTambahKredit.valid){
      this.formGagal = true;
      this.loadingButton = false;
      return false
    } else {
      return new Promise (resolve => {
        const param = new FormData();
        param.append('idkredit', this.idselectkredit);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'simpananpokok/tambahkreditsimpananpokok', {headers}).subscribe((res: any) => {
          if (res.status == 1){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
            this.auth.logout();
          } else if (res.status == 2){
            this.loadingButton = false;
            this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba masukan data lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.listData();
          }
        }, (err) => {
          this.loadingButton = false;
          if (err.status == 401){
            this.api.error(err);
            setTimeout(() => {
              this.loadStorage();
              this.tambahKredit();
            }, 300)
          } 
          else {
            this.api.error(err);
            this.gagalPost(6, '');
          }
        });
      })
    }
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
      this.tambahDebit()
    }else if (param == 4){
      this.formGagal = false
      this.tambahKredit()
    }
  }

  //event select debit
  async openDebit(e){
    this.isidataselectdebit = [];
    this.pageselectdebit = 1;
    this.cariselectdebit = "";
    this.selectDebit()
  }

  async onScrollingDebit(){
    this.pageselectdebit = parseInt(this.pageselectdebit) + 1;
    this.totalinputselectdebit = this.totalselectdebit;
    this.selectDebit();
  }

  async cariDatadebit(e){
    this.cariselectdebit = e.term;
    this.pageselectdebit = 1;
    this.selectDebit()
  }

  //event select debit
  async openKredit(e){
    this.isidataselectkredit = [];
    this.pageselectkredit = 1;
    this.cariselectkredit = "";
    this.selectKredit()
  }

  async onScrollingKredit(){
    this.pageselectkredit = parseInt(this.pageselectkredit) + 1;
    this.totalinputselectkredit = this.totalselectkredit;
    this.selectKredit();
  }

  async cariDataKredit(e){
    this.cariselectkredit = e.term;
    this.pageselectkredit = 1;
    this.selectKredit()
  }
}