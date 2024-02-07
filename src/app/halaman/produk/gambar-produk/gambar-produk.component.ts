import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { FileUpload, UploadEvent } from 'primeng/fileupload';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

const sesilogin = 'masterkbmv4_login';

@Component({
  selector: 'app-gambar-produk',
  templateUrl: './gambar-produk.component.html',
  styleUrls: ['./gambar-produk.component.scss']
})
export class GambarProdukComponent {
  @ViewChild('vsTable') vsTable:Table;

  //sesi
  sesiidlogin: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;
  url: any;
  idproduk: any;
  namaproduk: any;

  //data
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any;
  formGambarproduk: FormGroup;

  //data gambar
  isidatagambar: any[] = [];
  totalgambar: any;
  totaltampilgambar: any;
  pagegambar: any;
  carigambar: any;
  collectionSizegambar: any;
  pageSizegambar: any;
  totalinputgambar: any;
  idgambar: any;

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
  gambarSalah: any = false;
  buttonselectvisible: boolean = true;

  //form
  selectedFiles = []; 
  selectedNewfiles: Map<number, File | null> = new Map(); 
  isiGambar: any[] = [];
  newImg: Map<number, string | ArrayBuffer | null> = new Map();

  //dummy
  displayCustom: boolean | undefined;
  activeIndex: number = 0;
  images: any[] | undefined;
  responsiveOptions: any[] = [
      {
          breakpoint: '1500px',
          numVisible: 5
      },
      {
          breakpoint: '1024px',
          numVisible: 3
      },
      {
          breakpoint: '768px',
          numVisible: 2
      },
      {
          breakpoint: '560px',
          numVisible: 2
      }
  ];


  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public actRoute: ActivatedRoute,
    public route: Router,
    private location: Location
  ) {}

  async ngOnInit() {
    this.formGambarproduk = this.fb.group({
      idgambar: ['', [Validators.required]],
    });
    await this.loadStorage();
    this.idproduk = this.actRoute.snapshot.paramMap.get('idproduk');
    this.namaproduk = this.actRoute.snapshot.queryParamMap.get('d');;
    this.listData();
  }

  async imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
  }

  async loadStorage(){
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    this.sesiidlogin = sesivalue.sesiidlogin;
    this.sesiusername = sesivalue.sesiusername;
    this.sesitoken = sesivalue.sesitoken;
    this.sesinama = sesivalue.sesinama;
    this.sesiunik = sesivalue.sesiunik;

    this.page = 1;
    this.totalinput = 0;
    this.isidata = [];
  }

  async listData(){
    this.api.setCustomtitle('Gambar Produk ' + this.namaproduk)
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      param.append('idproduk', this.idproduk);
      param.append('halaman', this.page);
      param.append('totalinput', this.totalinput);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'produk/gambarproduk/list', {headers}).subscribe((res: any) => {
        this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } 
        else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'coba periksa kembali data yang anda akses!'});
          setTimeout(() => {
            this.kembali();
          }, 500);
        }
        else if (res.status == 99){
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

  async tambah(fileU){
    this.loadingButton = true;
    this.unvalid = true;
    return new Promise (resolve => {
      const paramTambah = new FormData();
      paramTambah.append('idproduk', this.idproduk);
      paramTambah.append('gambarproduk', this.selectedFiles[0]);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramTambah, 'produk/gambarproduk/tambah', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.loadingButton = false;
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.loadingButton = false;
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba periksa kembali data yang anda akses!'});
          setTimeout(() => {
            this.kembali();
          }, 500);
        } else if (res.status == 3){
          this.loadingButton = false;
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Coba pilih file gambar yang lain!'});
          this.gambarSalah = true;
        } else if (res.status == 99){
          this.loadingButton = false;
          this.popForm = false;
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data gambar katalog!'});
          this.page = 1;
          this.selectedFiles = [];
          fileU.clear();
          this.listData();
        }
      }, (err) => {
        this.loadingButton = false;
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.tambah(fileU);
          }, 300)
        } 
        else {
          this.api.error(err);
          this.gagalPost(3, '');
        }
      });
    })
  }

  async dataList(id){
    this.loadingForm = true;
    return new Promise (() => {
      const dataPerbarui = new FormData();
      dataPerbarui.append('idproduk', this.idproduk);
      dataPerbarui.append('idgambarproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(dataPerbarui, 'produk/gambarproduk/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.isiGambar = [{id: 1, nama: res.gambarproduk}];
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
    return new Promise (async resolve => {
      const paramPerbarui = new FormData();
      paramPerbarui.append('idproduk',  this.idproduk);
      paramPerbarui.append('idgambarproduk', this.idgambar);
      if(this.selectedNewfiles.get(1) !== undefined){
        paramPerbarui.append('gambar', this.selectedNewfiles.get(1));
      }
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramPerbarui, 'produk/gambarproduk/perbarui', {headers}).subscribe((res: any) => {
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
          this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, cobalah ketik nama gambar yang lain'});
        } else if (res.status == 4){
          this.loadingButton = false;
          this.messageService.add({severity: 'warn', summary: res.pesan, detail: 'Opps, periksa kembali data yang ingin anda upload'});
        } else if (res.status == 99){
          this.loadingButton = false;
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di gambar produk!'});
          this.popForm = false;
          this.listData();
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
          this.messageService.add({severity: 'error', summary: err.pesan, detail: 'Opps, terjadi kesalahan!'});
          this.api.error(err);
          this.gagalPost(5, '');
        }
      })
    })
  }

  async hapusData(id){
    return new Promise (async resolve => {
      const paramHapus = new FormData();
      paramHapus.append('idproduk', this.idproduk);
      paramHapus.append('idgambarproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramHapus, 'produk/gambarproduk/hapus', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 3){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di gambar produk!'});
          this.listData();
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
          this.messageService.add({severity: 'error', summary: err.pesan, detail: 'Opps, terjadi kesalahan!'});
          this.api.error(err);
        }
      })
    })
  }

  async coverGambar(id){
    return new Promise (async resolve => {
      const paramHapus = new FormData();
      paramHapus.append('idproduk', this.idproduk);
      paramHapus.append('idgambarproduk', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(paramHapus, 'produk/gambarproduk/perbaruicover', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 3){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil memperbarui cover gambar produk!'});
          this.listData();
        }
      }, (err) => {
        if (err.status == 401){
          this.api.error(err);
          setTimeout(() => {
            this.loadStorage();
            this.coverGambar(id);
          }, 300)
        } 
        else {
          this.messageService.add({severity: 'error', summary: err.pesan, detail: 'Opps, terjadi kesalahan!'});
          this.api.error(err);
        }
      })
    })
  }

  async konfirmHapus(id, target){
    this.idgambar = id.idgambarproduk;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus data ini?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idgambarproduk,
      accept: () => {
        this.hapusData(id.idgambarproduk)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formGambarproduk.get('idgambar').reset();
    this.gambarSalah = false;
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
      this.tambah(id)
    } else if (param == 4){
      this.formGagal = false
      this.dataList(this.idgambar)
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async openPop(p1, p2){
   if (p2 == 2){
      this.dataList(p1.idgambarproduk)
      this.popForm = true;
      this.namaForm = 'Perbarui Gambar Produk';
      this.idgambar = p1.idgambarproduk;
    }
  }


  //select event

  async imgTambah(e) {
    this.selectedFiles = e.currentFiles;
  }

  async imgBaru(event: any, idgambar: number) {
    const fileInput: HTMLInputElement = event.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const selectedFile: File = fileInput.files[0];
      this.selectedNewfiles.set(idgambar, selectedFile);
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

  async removeFile(file: File, uploader: FileUpload ) {
    const indexFile = uploader.files.indexOf(file);
    uploader.remove(event,  indexFile);
  }

  async removeFileisi(i){
    if(this.selectedNewfiles.get(1) !== undefined){
      this.selectedNewfiles.delete(1);
    }
  }

  async removeFiletambah(i){
    this.selectedFiles =  []
  }

  async kembali(){
    this.route.navigateByUrl('produk')
  }

  mouseenter(item){
    this.buttonselectvisible = item.idgambarproduk;
  }

  mouseleave(){
    this.buttonselectvisible = true;
  }

}
