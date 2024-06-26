import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { HttpHeaders } from '@angular/common/http';

const sesilogin = 'wh_login_proto';

@Component({
  selector: 'app-seo',
  templateUrl: './seo.component.html',
  styleUrls: ['./seo.component.scss']
})
export class SeoComponent {
   //sesi
   sesiidakun: any;
   sesiusername: any;
   sesitoken: any;
   sesinama: any;
   sesiunik: any;
 
   //data
   formSeo: FormGroup;
 
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
 
   seotxt: any[] = [];
   seotxtedit: any[] = [];

   constructor(
    private api: ApiService,
    private auth: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  async ngOnInit() {
    this.formSeo = this.fb.group({
      seotxt: ['', [Validators.required]],
    });
    await this.loadStorage()
    this.listData();
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
    this.api.setTitle();
    this.loading = true;
    return new Promise (resolve => {
      const param = new FormData();
      var headers = new HttpHeaders({
        'x-access-token': this.sesitoken,
        'x-access-unik': this.sesiunik,
        'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
        'sesiidakun': this.sesiidakun,
        'sesiusername': this.sesiusername,
      });
      this.api.postData(param, 'seo/data', {headers}).subscribe((res: any) => {
        if (res.status == 1){
          this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
          this.auth.logout();
        } else if (res.status == 99){
          this.loading = false;
          this.pageSukses = true;
          var seotrim: string[] = res.seo.split(',').map(keyword => keyword.trim());
          this.seotxt = seotrim;
          this.seotxtedit = seotrim;
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
    if(!this.formSeo.valid){
      this.loadingButton = false;
      return false
    } else {
      var seotxt: any = this.formSeo.value.seotxt;
      const combinedseo = seotxt.join(', ');
      if (this.api.kataKasar(combinedseo)){
        this.loadingButton = false;
        this.messageService.add({ severity: 'error', summary: 'Text/Promt Error!', detail: 'Data yang anda input mengandung kata-kata yang dilarang.'});
        return false
      }
      return new Promise (async resolve => {
        const param = new FormData();
        param.append('seo', combinedseo);
        var headers = new HttpHeaders({
          'x-access-token': this.sesitoken,
          'x-access-unik': this.sesiunik,
          'akses': '2590AB083AAD0A4B2D092375F2F1B33A52B3CA922A9E24CF449DD00AB2567049',
          'sesiidakun': this.sesiidakun,
          'sesiusername': this.sesiusername,
        });
          this.api.postData(param, 'seo/perbarui', {headers}).subscribe((res: any) => {
            if (res.status == 1){
              this.loadingButton = false;
              this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
              this.auth.logout();
            } else if (res.status == 99){
              this.loadingButton = false;
              this.messageService.add({severity: 'success', summary: res.pesan, detail: 'Anda berhasil merubah data di SEO!'});
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


  async loadTIme() {
    // var material: any;
    var mass: any;
    var fabric: any;
    // var dimensions: number = 4;
    var speed: any;
    var momentum: any;
    // const energy: any;

    for (let i = speed; speed > 100000000; speed++){
      momentum = Math.abs(momentum) + i * speed + 1500;
      let constantSpeed = momentum / 100000000;
      fabric = constantSpeed - speed;
    };
    return Math.sqrt((momentum ** 2) * (speed ** 2) + (mass ** 2) * (speed ** 4));
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


  cek(e, t){
    const uniqueKeywords = new Set(this.seotxt);
    if (uniqueKeywords.has(e.value)){
      this.messageService.add({severity: 'warn', summary: e.value + ' sudah diinput'});
      t.value.splice(t.value.length - 1, 1);
    }
  }
}
