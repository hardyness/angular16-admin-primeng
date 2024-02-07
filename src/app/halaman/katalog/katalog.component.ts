import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { FileUpload, UploadEvent } from 'primeng/fileupload';
import { ExcelService } from 'src/app/services/excel.service';

const sesilogin = 'masterkbmv4_login';

@Component({
  selector: 'app-katalog',
  templateUrl: './katalog.component.html',
  styleUrls: ['./katalog.component.scss']
})
export class KatalogComponent {
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
  formKatalog: FormGroup;
  idkatalog: any;

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

  //form
  katalog: any;
  uploadGambar = [];
  selectedFiles: Map<number, File | null> = new Map(); 
  isiGambar: any[] = [];
  newImg: Map<number, string | ArrayBuffer | null> = new Map();
  idgambar: any[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private excel: ExcelService,
  ) {}

  async ngOnInit() {
    this.getScreenSize();
    this.formKatalog = this.fb.group({
      idkategori: ['', [Validators.required]],
      katalog: ['', [Validators.required]],
    });
    await this.loadStorage()
    this.listData();
  }

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidlogin = sesivalue.sesiidlogin;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;

    //paging
    const page_s = localStorage.getItem('pagingKatalog')  || '{}';
    const page_v = JSON.parse(page_s);
    if (page_s !== '{}'){
      this.cari = page_v.cari;
    };
    localStorage.removeItem('pagingKategoriproduk');
    localStorage.removeItem('pagingProduk');
    localStorage.removeItem('pagingKategorikatalog');
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
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'katalog/list', {headers}).subscribe((res: any) => {
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
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(cekmenu, 'katalog/cek', {headers}).subscribe((res: any) => {
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
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'katalog/select', {headers}).subscribe((res: any) => {
        this.collectionSizekategori = Math.ceil(parseInt(res.total) / parseInt(res.length));
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
                this.isidatakategori = [...this.isidatakategori, {idkategorikatalog: isi.idkategorikatalog, kategorikatalog: isi.kategorikatalog}];
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
    if(!this.formKatalog.valid){
      this.loadingButton = false;
      return false
    } else {
      var katalog: any = this.formKatalog.value.katalog;
      if (this.api.kataKasar(katalog)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const paramTambah = new FormData();
        paramTambah.append('kategorikatalog', this.idkategori);
        paramTambah.append('katalog', katalog);
        paramTambah.append('gambar', this.uploadGambar[0]);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(paramTambah, 'katalog/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data kategori katalog!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('pagingKatalog')
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
            this.messageService.add({severity: 'error', summary: err.pesan, detail: 'Opps, terjadi kesalahan!'});
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
      dataPerbarui.append('idkatalog', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'katalog/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.katalog = res.katalog;
          this.isidatakategori = [{idkategorikatalog: res.idkategorikatalog, kategorikatalog: res.kategorikatalog}];
          this.kategori = res.idkategorikatalog;
          this.idkategori = res.idkategorikatalog;
          this.kategoriText = res.kategorikatalog;
          this.isiGambar = [{id: 1, nama: res.gambar}];
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
    if(!this.formKatalog.valid){
      this.loadingButton = false;
      return false
    } else {
      var katalog: any = this.formKatalog.value.katalog;
      if (this.api.kataKasar(katalog)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        paramPerbarui.append('idkatalog',  this.idkatalog);
        paramPerbarui.append('kategorikatalog', this.idkategori);
        paramPerbarui.append('katalog', katalog);
        if(this.selectedFiles.get(1) !== undefined){
          paramPerbarui.append('gambar', this.selectedFiles.get(1));
        }
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
        this.api.postData(paramPerbarui, 'katalog/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, cobalah ketik nama kategori yang lain'});
          } else if (res.status == 99){
            this.loadingButton = false;
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di katalog!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idkatalog === this.idkatalog);
            if (index !== -1) {
              this.isidata[index].katalog = katalog;
              if (this.kategori == this.idkategori){
                this.isidata[index].kategorikatalog = this.kategoriText;
              }
              if (this.selectedFiles.get(1) !== undefined){
                this.isidata[index].gambar = this.newImg.get(1);
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
      const paramPerbarui = new FormData();
      paramPerbarui.append('idkatalog',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramPerbarui, 'katalog/hapus', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di katalog!'});
          this.totalinput = 0;
          this.InfiniteData = true;
          this.listData();
          var index = this.isidata.findIndex(item => item.idkatalog === id);
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
    this.idkatalog = id.idkatalog;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.kategorikatalog + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idkatalog,
      accept: () => {
        this.hapusData(id.idkatalog)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formKatalog.get('idkategori').reset();
    this.formKatalog.get('katalog').reset();
    this.removeFileisi();
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
      this.dataList(this.idkatalog)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Katalog';
    } else if (p2 == 2){
      this.dataList(p1.idkatalog)
      this.popForm = true;
      this.namaForm = 'Perbarui Data Katalog';
      this.idkatalog = p1.idkatalog;
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
      localStorage.setItem('pagingKatalog', JSON.stringify(dataPage));
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
    localStorage.setItem('pagingKatalog', JSON.stringify(dataPage));
  }

  onScroll(e){
    this.totalinput = this.total;
    setTimeout(() => {
      this.page = parseInt(this.page) + 1;
      this.listData();
    }, 500);
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
    this.idkategori = e.idkategorikatalog;
    this.kategoriText = e.kategorikatalog;
  }

  imgTambah(e) {
    this.uploadGambar = e.currentFiles;
  }

  imgBaru(event: any, idgambar: number) {
    const fileInput: HTMLInputElement = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile: File = fileInput.files[0];
      this.selectedFiles.set(idgambar, selectedFile);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newImg.set(idgambar, e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      if (selectedFile && !this.idgambar.includes(idgambar)){
        this.idgambar.push(idgambar);
      }
    }
  }

  removeFile(file: File, uploader: FileUpload ) {
    const indexFile = uploader.files.indexOf(file);
    uploader.remove(event,  indexFile);
  }

  removeFileisi(){
    if(this.selectedFiles.get(1) !== undefined){
      this.selectedFiles.delete(1);
    }
  }

  async downloadexcel(){
    var header = ['Id Katalog', 'Kategori Katalog','Katalog', 'Gambar']
    this.excel.generateExcel('Data Katalog', 'Katalog', header, this.isidata)
  }
}
