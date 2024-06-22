import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';  
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';

import { NavigationEnd, NavigationExtras, NavigationStart, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { LocaleSettings } from 'primeng/calendar';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-pengguna',
  templateUrl: './pengguna.component.html',
  styleUrls: ['./pengguna.component.scss'],
  providers: [DatePipe],
})
export class PenggunaComponent {
  @ViewChild('vsTable') vsTable:Table;
  usernamePengguna: any;
  mulaiPengguna: any;
  passwordPengguna: any;
  teksLevelAkses: any;
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
  blockSpace: RegExp = /[^s]/;

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
  formPengguna: FormGroup;
  namaPengguna: any;
  idakun: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingSelect: boolean;
  loadingHapus: any;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  InfiniteData = false;
  InfiniteDataLevel = false;
  scrollTable: any;
  calendarsetting:LocaleSettings = {
    firstDayOfWeek: 1,
  };
  subLayout: any;
  subHttp: any;

  // Level Pengguna
  selectedLevelPengguna: any;
  levelPengguna: any;
  dataLevelPengguna = [
    { teksLevelAkses: 'Master', idLevelAkses: 1 },
    { teksLevelAkses: 'Pengurus Dan Pengawas', idLevelAkses: 2 },
    { teksLevelAkses: 'Manajer', idLevelAkses: 3 },
    { teksLevelAkses: 'Kabid', idLevelAkses: 4 },
    { teksLevelAkses: 'Staff', idLevelAkses: 5 },
    { teksLevelAkses: 'Marketing Eksternal', idLevelAkses: 6 },
  ];
  local: LocaleSettings

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: Router,

    private layoutservice: LayoutService,
    public primengConfig: PrimeNGConfig,
    // public translate: TranslateService,
    private datePipe: DatePipe,
  ) {
  }

  async ngOnInit() {
    this.api.setHeader('Pengguna');
    this.getScreenSize();
    this.formPengguna = this.fb.group({
      namaPengguna: ['', [Validators.required]],
      usernamePengguna: ['', [Validators.required, this.noSpaceValidator]],
      passwordPengguna: ['', [Validators.required]],
      levelPengguna: ['', [Validators.required]],
      mulaiPengguna: ['', [Validators.required]],
    });
    await this.loadStorage();
    const page_s = localStorage.getItem('pagingPengguna')  || '{}';
    const page_v = JSON.parse(page_s);
    this.subLayout = this.layoutservice.emittersearch$.subscribe(data => {
      if (data !== ''){
        this.emitsearch(data)
      }
      else if (page_v.isi !== undefined){
        this.page = page_v.page;
        this.totalinput = 0;
        this.isidata = page_v.isi;
        this.cari = page_v.cari;
        this.listData();
        setTimeout(() => {
          document.getElementById(page_v.idakun).scrollIntoView({
            block: "center",
            inline: "nearest",
            });
        }, 1100, localStorage.setItem('pagingPengguna', JSON.stringify({cari: page_v.cari, page: page_v.page})));
      }
      else {
        const page_s = localStorage.getItem('search_history')  || '{}';
        const page_v = JSON.parse(page_s);
        if (page_s !== '{}'){
          this.cari = page_v.cari;
        }
        else {
          this.cari = '';
        }
        this.page = 1;
        this.totalinput = 0;
        this.listData();
      }
    });
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
      this.subHttp = this.api.postData(param, 'pengguna/list', {headers}).subscribe((res: any) => {
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
          };
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
      this.subHttp = this.api.postData(cekmenu, 'pengguna/cek', {headers}).subscribe((res: any) => {
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

  async test(e){
    this.datePipe.transform(e, 'yyyy/MM/dd');
    console.log(this.datePipe.transform(e, 'yyyy/MM/dd'));
  }

  async tambah(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formPengguna.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaPengguna: any = this.formPengguna.value.namaPengguna.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      var usernamePengguna: any = this.formPengguna.value.usernamePengguna;
      var passwordPengguna: any = this.formPengguna.value.passwordPengguna;
      var levelPengguna: any = this.levelPengguna;
      var mulaiPengguna: any = this.formPengguna.value.mulaiPengguna;
      console.log(mulaiPengguna)
      const parts = mulaiPengguna.split("-");
      mulaiPengguna = parts.join("/");
      if (this.api.kataKasar(namaPengguna)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      if (this.api.kataKasar(usernamePengguna)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const param = new FormData();
        param.append('username', usernamePengguna);
        param.append('password', passwordPengguna);
        param.append('nama', namaPengguna);
        param.append('level', levelPengguna);
        param.append('mulai', mulaiPengguna);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'pengguna/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data Pengguna!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('paging_pengguna')
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
      dataPerbarui.append('idpengguna', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'pengguna/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.namaPengguna = res.nama;
          this.usernamePengguna = res.username;
          this.passwordPengguna = res.password;
          this.selectedLevelPengguna = res.level;
          // var mulai = res.mulai;
          // this.convertDateFormat(res.mulai);
          // this.mulaiPengguna = mulai;
          // console.log(mulai)
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

  convertDateFormat(originalDate: string): string {
    const parts = originalDate.split('-');
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return this.mulaiPengguna = formattedDate;
  }

  async perbarui(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formPengguna.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaPengguna: any = this.formPengguna.value.namaPengguna.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var usernamePengguna: any = this.formPengguna.value.usernamePengguna;
      var passwordPengguna: any = this.formPengguna.value.passwordPengguna;
      var mulaiPengguna: any = this.formPengguna.value.mulaiPengguna;
      var levelPengguna: any = this.levelPengguna;
      const parts = mulaiPengguna.split("-");
      console.log(parts)
      // mulaiPengguna = parts.join("/");
      if (this.api.kataKasar(namaPengguna)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idpengguna',  this.idakun);
        param.append('username', usernamePengguna);
        param.append('password', passwordPengguna);
        param.append('nama', namaPengguna);
        param.append('level', levelPengguna);
        param.append('mulai', mulaiPengguna);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'pengguna/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di Pengguna!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idpengguna === this.idakun);
            if (index !== -1) {
              this.isidata[index].pengguna = namaPengguna;
              this.isidata[index].username = usernamePengguna;
              this.isidata[index].password = passwordPengguna;
              this.isidata[index].level = levelPengguna;
              this.isidata[index].mulai = mulaiPengguna;
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
      param.append('idpengguna',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'pengguna/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data Pengguna!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idakun === id);
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
    this.idakun = id.idpengguna;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.nama + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idpengguna,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idpengguna)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formPengguna.get('namaPengguna').reset();
    this.formPengguna.get('usernamePengguna').reset();
    this.formPengguna.get('passwordPengguna').reset();
    this.formPengguna.get('levelPengguna').reset();
    this.formPengguna.get('mulaiPengguna').reset();
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
      this.dataList(this.idakun)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async levelAksesPengguna(item){
    var dataPage = {
      cari: this.cari,
      scrl: this.scrollTable,
      isi: this.isidata,
      page: this.page,
      idakun: item.idpengguna
    }
    localStorage.setItem('pagingPengguna', JSON.stringify(dataPage));
    const navigationExtras: NavigationExtras = {
    queryParams: {
      d: item.nama,
      e: item.levelteks
    }};
    this.route.navigate(['pengguna/akses-level-pengguna/' + item.idpengguna], navigationExtras);
  }

  async gajiSink(item){
    var dataPage = {
      cari: this.cari,
      scrl: this.scrollTable,
      isi: this.isidata,
      page: this.page,
      pengguna: item.pengguna
    }
    localStorage.setItem('pagingPengguna', JSON.stringify(dataPage));
    const navigationExtras: NavigationExtras = {
    queryParams: {
      d: item.nama,
      e: item.levelteks
    }};
    this.route.navigate(['pengguna/gaji-sink/' + item.idpengguna], navigationExtras);
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Pengguna';
    } else if (p2 == 2){
      this.dataList(p1.idpengguna)
      this.popForm = true;
      this.dataLevelPengguna;
      console.log(this.dataLevelPengguna)
      this.namaForm = 'Perbarui Data Pengguna';
      this.idakun = p1.idpengguna;
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

  //select event
  async openLevelPengguna(e){
    console.log('Trigger dataLevelPengguna')
    this.dataLevelPengguna;
    // this.dataList();
  }

  async selectedLevel(e){
    if (e !== undefined){
      this.teksLevelAkses = e.teksLevelAkses;
      this.levelPengguna = e.idLevelAkses;
    }
  }

  noSpaceValidator(control) {
    if (control.value && control.value.indexOf(' ') >= 0) {
      return { 'noSpace': true };
    }
    return null;
  }

}
