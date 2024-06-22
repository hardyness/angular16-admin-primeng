import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';

import { LayoutService } from 'src/app/layout/service/app.layout.service';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-kantor',
  templateUrl: './kantor.component.html',
  styleUrls: ['./kantor.component.scss']
})
export class KantorComponent {
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
  isidata: any[] = [];
  total: any;
  totaltampil: any;
  page: any = 1;
  cari: any = '';
  collectionSize: any;
  pageSize: any;
  totalinput: any = 0;
  formKantor: FormGroup;
  kodekantor: any;
  namakantor: any;
  lat: any;
  lng: any;
  radius: any;
  idkantor: any;

  lat_s: any;
  lng_s: any;

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
  onedit = false;
  subLayout: any;
  subHttp: any;

  //map
  mapOptions: google.maps.MapOptions;
  markerPosition: google.maps.LatLngLiteral[] = [];
  lokasiskrng: GeolocationPosition;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

    private layoutservice: LayoutService
  ) {}

  async ngOnInit() {
    this.api.setHeader('Daftar Kantor');
    this.getScreenSize();
    this.formKantor = this.fb.group({
      namaKantor: ['', [Validators.required]],
      kode: ['', [Validators.required]],
      lat: ['', [Validators.required]],
      lng: ['', [Validators.required]],
      radius: ['', [Validators.required]],
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
          this.cari = page_v.cari_pekerjaan;
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
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'kantor/list', {headers}).subscribe((res: any) => {
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
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(cekmenu, 'kantor/cek', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loadingForm = false;
          if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
              (position: GeolocationPosition) => {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
                this.mapOptions = {
                  center: { lat: parseFloat(this.lat), lng: parseFloat(this.lng) },
                  zoomControl: true,
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: false,
                  controlSize: 20,
                  mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                  }
                };
                this.markerPosition = [{lat: parseFloat(this.lat), lng: parseFloat(this.lng)}];
              }
            );
          }
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
    if(!this.formKantor.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaKantor: any = this.formKantor.value.namaKantor.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var kode: any = this.formKantor.value.kode;
      var lat: any = this.formKantor.value.lat;
      var lng: any = this.formKantor.value.lng;
      var radius: any = this.formKantor.value.radius;
      if (this.api.kataKasar(namaKantor)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (resolve => {
        const param = new FormData();
        param.append('kantor', namaKantor);
        param.append('kode', kode);
        param.append('lat', lat);
        param.append('lng', lng);
        param.append('radius', radius);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'kantor/tambah', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menambah data kantor!'});
            if (this.total == 0){
              this.cari = '';
              localStorage.removeItem('paging_pekerjaan')
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
      dataPerbarui.append('idkantor', id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(dataPerbarui, 'kantor/data', {headers}).subscribe((res: any) => {
        if (res.status == 1) {
          this.messageService.add({ severity: 'error', summary: res.pesan, detail: 'akses data ditolak!' });
          this.auth.logout();
        } else if (res.status == 2) {
          this.messageService.add({ severity: 'warn', summary: res.pesan, detail: 'pastikan data yang diperbaharui sudah benar!'});
          this.loadingForm = false;
          this.popForm = false;
        } else if (res.status == 99) {
          this.loadingForm = false;
          this.namakantor = res.kantor;
          this.kodekantor = res.kode;
          this.lat = res.lat;
          this.lng = res.lng;
          this.lat_s = res.lat;
          this.lng_s = res.lng;
          this.radius = res.radius;
          this.mapOptions = {
            center: { lat: parseFloat(this.lat), lng: parseFloat(this.lng) },
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            controlSize: 20,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
          };
          this.markerPosition = [{lat: parseFloat(this.lat), lng: parseFloat(this.lng)}];
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
    if(!this.formKantor.valid){
      this.loadingButton = false;
      return false
    } else {
      var namaKantor: any = this.formKantor.value.namaKantor.replace(/\b\w/g, (char: string) => char.toUpperCase());
      var kode: any = this.formKantor.value.kode;
      var lat: any = this.formKantor.value.lat;
      var lng: any = this.formKantor.value.lng;
      var radius: any = this.formKantor.value.radius;
      if (this.api.kataKasar(namaKantor)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('idkantor',  this.idkantor);
        param.append('kantor', namaKantor);
        param.append('kode', kode);
        param.append('lat', lat);
        param.append('lng', lng);
        param.append('radius', radius);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
        this.subHttp = this.api.postData(param, 'kantor/perbarui', {headers}).subscribe((res: any) => {
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
            this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di pekerjaan!'});
            this.popForm = false;
            this.totalinput = 0;
            this.listData();
            let index = this.isidata.findIndex(item => item.idkantor === this.idkantor);
            if (index !== -1) {
              this.isidata [index].kantor = namaKantor;
              this.isidata [index].kodekantor = kode;
              this.isidata [index].lat = lat;
              this.isidata [index].lng = lng;
              this.isidata [index].radius = radius;
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
      param.append('idkantor',  id);
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': 'C9AC27E0492481C5E07CA7DF996811B1',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.subHttp = this.api.postData(param, 'kantor/hapus', {headers}).subscribe((res: any) => {
        this.loadingHapus = false;
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 2){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Pastikan data yang ingin anda akses'});
        } else if (res.status == 99){
          this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil menghapus data di kantor!'});
          this.totalinput = 0;
          this.listData();
          var index = this.isidata.findIndex(item => item.idkantor === id);
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
    this.idkantor = id.idkantor;
    this.confirmationService.confirm({
      target: target,
      message: 'yakin ingin menghapus ' + id.kantor + '?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      dismissableMask: true,
      key: id.idkantor,
      acceptButtonStyleClass:"p-button-danger",
      accept: () => {
        this.hapusData(id.idkantor)
      },
      reject: () => {
      }
    });
  }

  //form
  async formKosong(){
    this.formKantor.get('namaKantor').reset();
    this.formKantor.get('kode').reset();
    this.formKantor.get('lat').reset();
    this.formKantor.get('lng').reset();
    this.formKantor.get('radius').reset();
    this.onedit = false;
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
      this.cekTambah();
    } else if (param == 3){
      this.formGagal = false
      this.tambah();
    } else if (param == 4){
      this.formGagal = false
      this.dataList(this.idkantor);
    } else if (param == 5){
      this.formGagal = false
      // this.perbarui()
    }
  }

  async openPop(p1, p2){
    if (p2 == 1){
      this.cekTambah();
      this.popForm = true;
      this.namaForm = 'Tambah Kantor';
    } else if (p2 == 2){
      this.dataList(p1.idkantor);
      this.popForm = true;
      this.namaForm = 'Perbarui Data Kantor';
      this.idkantor = p1.idkantor;
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

  async addMarker(event: google.maps.MapMouseEvent) {
    this.onedit = true;
    this.lat = event.latLng.toJSON().lat;
    this.lng = event.latLng.toJSON().lng;
    this.markerPosition = [{lat: this.lat, lng: this.lng}];
  }

  async resetMap(type){
    this.onedit = false;
    if (type === 1){
      if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
            this.mapOptions = {
              center: { lat: parseFloat(this.lat), lng: parseFloat(this.lng) },
              zoomControl: true,
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: false,
              controlSize: 20,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
              }
            };
            this.markerPosition = [{lat: parseFloat(this.lat), lng: parseFloat(this.lng)}];
          }
        );
      }
    } else {
      this.lat = this.lat_s;
      this.lng = this.lng_s;
      this.mapOptions = {
        center: { lat: parseFloat(this.lat), lng: parseFloat(this.lng) },
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        controlSize: 20,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
      };
      this.markerPosition = [{lat: parseFloat(this.lat), lng: parseFloat(this.lng)}];
    }
  }

  async openMap(lat, lng) {
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          var link = ""+"http://maps.google.com/maps?saddr="+this.lat+","+this.lng +" &daddr="+lat+","+lng;
          window.open(link);
        }, (err) => {
          if (err.code == 1){
            this.messageService.add({severity: 'error', summary: err.message, detail: 'Anda tidak memberikan izin lokasi pada browser'});
          }
        }
      );
    }
  }
}
