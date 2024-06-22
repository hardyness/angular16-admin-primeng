import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';  
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';

import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-akses-level-penggunaakses',
  templateUrl: './akses-level-pengguna.component.html',
  styleUrls: ['./akses-level-pengguna.component.scss']
})
export class AksesLevelPenggunaComponent {
  @ViewChild('vsTable') vsTable:Table;
  teksLevelAkses: any;
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
  formPenggunakses: FormGroup;
  namaPengguna: any;
  idpengguna: any;
  idakses: any;
  namalogin: any;
  level: any;

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
  subLayout: any;

  akses: any;

  // Level Akses Pengguna
  selectedLevelPengguna: any;
  levelPengguna: any;
  selectdataakses = [
    { teksLevelAkses: 'Teller', idselectakses: 1 },
    { teksLevelAkses: 'Admin', idselectakses: 2 },
    { teksLevelAkses: 'Keuangan', idselectakses: 3 },
    { teksLevelAkses: 'CS', idselectakses: 4 },
    { teksLevelAkses: 'AO', idselectakses: 5 },
    { teksLevelAkses: 'FO', idselectakses: 6 },
    { teksLevelAkses: 'COL', idselectakses: 7 },
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: Router,

    private layoutservice: LayoutService,
    public actRoute: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.api.setHeader('Pengguna > Akses Pengguna');
    this.getScreenSize();
    this.formPenggunakses = this.fb.group({
      akses: ['', [Validators.required]],
    });
    await this.loadStorage();
    this.idpengguna = this.actRoute.snapshot.paramMap.get('idpengguna');
    this.namalogin = this.actRoute.snapshot.queryParamMap.get('d');
    this.level = this.actRoute.snapshot.queryParamMap.get('e');
    const page_s = localStorage.getItem('pagingPengguna')  || '{}';
    const page_v = JSON.parse(page_s);
    this.subLayout = this.layoutservice.emittersearch$.subscribe(data => {
      if (data !== ''){
        this.emitsearch(data)
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
    localStorage.removeItem('schstatus');
  }

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidakun = sesivalue.sesiidakun;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;
    localStorage.setItem('schstatus', '2');
  }

  async listData(){
    this.loadingData = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('halaman', this.page);
      param.append('cari', this.cari);
      param.append('totalinput', this.totalinput);
      param.append('idpengguna', this.idpengguna);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'penggunaakses/list', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        }
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'coba periksa kembali data yang anda akses!'});
        }
        else if (res.status == 99){
          this.api.setCustomtitle('Akses Akses Pengguna - ' + this.namalogin + ' | KBM Master');
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
      cekmenu.append('idpengguna', this.idpengguna);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(cekmenu, 'penggunaakses/cek', {headers}).subscribe((res: any) => {
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

  async tambah(){
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formPenggunakses.valid){
      this.loadingButton = false;
      return false
    } else {
      var akses: any = this.formPenggunakses.value.akses; 
      return new Promise (resolve => {
        const param = new FormData();
        param.append('idpengguna', this.idpengguna);
        param.append('akses', akses);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'penggunaakses/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data Akses Pengguna!'});
            this.page = 1;
            this.totalinput = 0;
            this.listData();
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
      dataPerbarui.append('idpengguna', this.idpengguna);
      dataPerbarui.append('idakses', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'penggunaakses/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
          
        } else if (res.status == 3) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
          
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.selectedLevelPengguna = res.level;
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
    console.log(this.idakses);
    this.loadingButton = true;
    this.unvalid = true;
    if(!this.formPenggunakses.valid){
      this.loadingButton = false;
      return false
    } else {
      var akses: any = this.formPenggunakses.value.akses;
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idpengguna', this.idpengguna);
        param.append('idakses', this.idakses);
        param.append('akses', akses);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(param, 'penggunaakses/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di Akses Pengguna!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idpengguna === this.idpengguna);
            if (index !== -1) {
              this.isidata [index].penggunaakses = akses;
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
      param.append('idpengguna', this.idpengguna);
      param.append('idakses', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'penggunaakses/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data Akses Pengguna!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idpengguna === id);
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
    this.idakses = id.idakses;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.akses + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idakses,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idakses)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formPenggunakses.get('akses').reset();
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
      this.dataList(this.idakses)
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
      idakun: item.idakun
    }
    localStorage.setItem('pagingPengguna', JSON.stringify(dataPage));
    const navigationExtras: NavigationExtras = {
    queryParams: {
      d: item.nama
    }};
    this.route.navigate(['penggunaakses/akses-level-penggunaakses/' + item.idakun], navigationExtras);
  }

  async openPop(p1, p2){
    this.selectdataakses = [
      { teksLevelAkses: 'Teller', idselectakses: 1 },
      { teksLevelAkses: 'Admin', idselectakses: 2 },
      { teksLevelAkses: 'Keuangan', idselectakses: 3 },
      { teksLevelAkses: 'CS', idselectakses: 4 },
      { teksLevelAkses: 'AO', idselectakses: 5 },
      { teksLevelAkses: 'FO', idselectakses: 6 },
      { teksLevelAkses: 'COL', idselectakses: 7 },
    ];
    if (p2 == 1){
      this.selectdataakses = this.selectdataakses.filter(item2 => !this.isidata.some(item1 => item1.akses === item2.teksLevelAkses));
      if (this.selectdataakses.length == 0){
        this.messageService.add({severity: 'error', summary: 'Tidak bisa tambah', detail: 'Semua akses sudah terinput!'});
      } else {
        this.cekTambah();
        this.popForm = true;
        this.namaForm = 'Tambah Akses Pengguna';
      }
    } else if (p2 == 2){
      this.dataList(p1.idakses)
      this.popForm = true;
      this.selectdataakses;
      this.namaForm = 'Perbarui Data Akses Pengguna';
      this.idakses = p1.idakses;
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

  async kembali(){
    this.route.navigateByUrl('pengguna')
  }

  //select event
  async selectedLevel(e){
    if (e !== undefined) {
      this.teksLevelAkses = e.teksLevelAkses;
      this.levelPengguna = e.idselectakses;
    }
  }

  noSpaceValidator(control) {
    if (control.value && control.value.indexOf(' ') >= 0) {
      return { 'noSpace': true };
    }
    return null;
  }

}
