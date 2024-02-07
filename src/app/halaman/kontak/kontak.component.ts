import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { HttpHeaders } from '@angular/common/http';

const sesilogin = 'masterkbmv4_login';

@Component({
  selector: 'app-kontak',
  templateUrl: './kontak.component.html',
  styleUrls: ['./kontak.component.scss']
})
export class KontakComponent {
  //sesi
  sesiidlogin: any;
  sesiusername: any;
  sesitoken: any;
  sesinama: any;
  sesiunik: any;

  //data
  formTentangKami: FormGroup;
  alamat: any;
  telephone: any;
  email: any;
  instagram: any;
  facebook: any;
  tiktok: any;
  lat: any;
  lng: any;

  //loading
  load: any[] = [];
  loading: boolean = true;
  pageSukses = false;
  pageGagal = false;
  formGagal = false;
  loadingButton: boolean;

  //event
  popForm: boolean = false;
  namaForm: string;
  unvalid = false;
  onedit = false;

  kontakkami: any;
  kontakkamiedit: any;

  mapOptions: google.maps.MapOptions;

  markerPosition: google.maps.LatLngLiteral[] = [];;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {}

  async ngOnInit() {
    this.formTentangKami = this.fb.group({
      kontakkami: ['', [Validators.required]],
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
  }

  async listData(){
    this.api.setTitle();
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidlogin': this.sesiidlogin,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'kontakkami/data', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loading = false;
          this.pageSukses = true;
          this.alamat = res.alamat;
          this.telephone = res.telepon;
          this.email = res.email;
          this.instagram = res.instagram;
          this.facebook = res.facebook;
          this.tiktok = res.tiktok;
          this.lat = res.lat;
          this.lng = res.lng;
          this.mapOptions = {
            center: { lat: parseFloat(this.lat), lng: parseFloat(this.lng) },
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: false,
          };
          this.markerPosition = [{lat: parseFloat(this.lat), lng: parseFloat(this.lng)}];
          this.onedit = false;
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

  async perbarui(){
    this.loadingButton = true;
    this.unvalid = true;
    if(this.alamat == '' || this.email == '' || this.telephone == '' || this.instagram == '' || this.facebook == '' || this.tiktok == ''){
      this.loadingButton = false;
      return false
    } else {
      if (this.api.kataKasar(this.alamat || this.email || this.telephone || this.instagram || this.facebook || this.tiktok)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const paramPerbarui = new FormData();
        paramPerbarui.append('alamat', this.alamat);
        paramPerbarui.append('telepon', this.telephone);
        paramPerbarui.append('email', this.email);
        paramPerbarui.append('instagram', this.instagram);
        paramPerbarui.append('facebook', this.facebook);
        paramPerbarui.append('tiktok', this.tiktok);
        paramPerbarui.append('lat', this.lat);
        paramPerbarui.append('lng', this.lng);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidlogin': this.sesiidlogin,
          'sesiusername': this.sesiusername,
        });
          this.api.postData(paramPerbarui, 'kontakkami/perbarui', {headers}).subscribe((res: any) => {
            if (res.status == 1){
              this.loadingButton = false;
              this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
              this.auth.logout();
            } else if (res.status == 99){
              this.loadingButton = false;
              this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di Tentang Kami!'});
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
              this.api.error(err);
              this.gagalPost(5, '');
            }
          })
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
    } else if (tipe == 2 || tipe == 3 || tipe == 4 || tipe == 5){
      this.formGagal = true
    }
  }

  async reload(param, id){
    if (param == 1) {
      this.pageGagal = false;
      this.listData();
    } else if (param == 5){
      this.formGagal = false
      this.perbarui()
    }
  }

  async addMarker(event: google.maps.MapMouseEvent) {
    if (this.onedit == true){
      this.lat = event.latLng.toJSON().lat;
      this.lng = event.latLng.toJSON().lng;
      this.markerPosition = [{lat: this.lat, lng: this.lng}];
    }
  }
}
