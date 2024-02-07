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
  selector: 'app-jaminan',
  templateUrl: './jaminan.component.html',
  styleUrls: ['./jaminan.component.scss']
})
export class JaminanComponent {
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
  formJaminan: FormGroup;
  namaJaminan: any;
  idjaminan: any;

  //loading
  load: any[] = [];
  loadingData: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingForm = false;
  loadingButton: boolean;
  loadingHapus: any;

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
    private excel: ExcelService,
    private layoutservice: LayoutService
  ) {}

  async ngOnInit() {
    this.getScreenSize();
    this.formJaminan = this.fb.group({
      namaJaminan: ['', [Validators.required]],
    });
    await this.loadStorage()
    this.layoutservice.emittersearch$.subscribe(data => {
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

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidlogin = sesivalue.sesiidlogin;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;

    //pagging
    localStorage.removeItem('pagingKategoriproduk');
    localStorage.removeItem('pagingProduk');
    localStorage.removeItem('pagingKatalog');
    localStorage.removeItem('pagingPengunjung');
    localStorage.removeItem('pagingCustom');
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
      this.api.postData(param, 'jaminan/list', {headers}).subscribe((res: any) => {
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
      this.api.postData(cekmenu, 'jaminan/cek', {headers}).subscribe((res: any) => {
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
    if(!this.formJaminan.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaJaminan: any = this.formJaminan.value.namaJaminan.replace(/\b\w/g, (char: string) => char.toUpperCase());
      if (this.api.kataKasar(namaJaminan)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const paramTambah = new FormData();
        paramTambah.append('jaminan', namaJaminan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(paramTambah, 'jaminan/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data jaminan!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('paging_jaminan')
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
      dataPerbarui.append('idjaminan', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'jaminan/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.namaJaminan = res.jaminan;
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
    if(!this.formJaminan.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaJaminan: any = this.formJaminan.value.namaJaminan.replace(/\b\w/g, (char: string) => char.toUpperCase());
      if (this.api.kataKasar(namaJaminan)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        paramPerbarui.append('idjaminan',  this.idjaminan);
        paramPerbarui.append('jaminan', namaJaminan);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(paramPerbarui, 'jaminan/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di jaminan!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idjaminan === this.idjaminan);
            if (index !== -1) {
              this.isidata [index].jaminan = namaJaminan;
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
      const paramHapus = new FormData();
      paramHapus.append('idjaminan',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramHapus, 'jaminan/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di jaminan!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idjaminan === id);
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
    this.idjaminan = id.idjaminan;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.jaminan + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idjaminan,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idjaminan)
      },
      reject: () => {
      }
    });
  }


  //form
  async formKosong(){
    this.formJaminan.get('namaJaminan').reset();
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
      this.dataList(this.idjaminan)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Jaminan';
    } else if (p2 == 2){
      this.dataList(p1.idjaminan)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Jaminan';
      this.idjaminan = p1.idjaminan;
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
    var header = ['Id jaminan',  'Jaminan']
    this.excel.generateExcel('Data jaminan', 'jaminan', header, this.isidata)
  }
}
