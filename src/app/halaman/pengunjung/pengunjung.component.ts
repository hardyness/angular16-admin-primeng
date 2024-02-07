import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { Table } from 'primeng/table';
import { HttpHeaders } from '@angular/common/http';
import { ExcelService } from 'src/app/services/excel.service';

const sesilogin = 'masterkbmv4_login';

@Component({
  selector: 'app-pengunjung',
  templateUrl: './pengunjung.component.html',
  styleUrls: ['./pengunjung.component.scss']
})
export class PengunjungComponent {
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
   formKategoriproduk: FormGroup;
   idkategori: any;
 
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
   InfiniteData = false;
   scrollTable: any;
 
   constructor(
     private api: ApiService,
     private auth: AuthService,
     private messageService: MessageService,
     private excel: ExcelService,
   ) {}
 
   async ngOnInit(event: KeyboardEvent) {
     this.getScreenSize();
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
     const page_s = localStorage.getItem('pagingPengunjung')  || '{}';
     const page_v = JSON.parse(page_s);
     if (page_s !== '{}'){
       this.cari = page_v.cari;
     };
     localStorage.removeItem('pagingKategoriproduk');
     localStorage.removeItem('pagingProduk');
     localStorage.removeItem('pagingKategorikatalog');
     localStorage.removeItem('pagingKatalog');
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
       this.api.postData(param, 'pengunjung/list', {headers}).subscribe((res: any) => {
         this.collectionSize = Math.ceil(parseInt(res.total) / parseInt(res.length));
         if (res.status == 1){
           this.messageService.add({severity: 'error', summary: res.pesan, detail: 'Akses Anda ditolak!'});
           this.auth.logout();
         } else if (res.status == 99){
           this.loading = false;
           this.pageSukses = true;
           this.total = res.total;
           this.totaltampil = res.length;
           if (this.page == 1){
             this.pageSize = 1;
             this.isidata = res.hasil;
           } 
           else {
             if (this.isidata.length < res.total){
               for (let isi of res.hasil){
                 this.isidata.push(isi)
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
     }
   }
 
   async reload(param, id){
     if (param == 1) {
       this.pageGagal = false;
       this.listData();
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
       localStorage.setItem('pagingPengunjung', JSON.stringify(dataPage));
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
     localStorage.setItem('pagingPengunjung', JSON.stringify(dataPage));
   }
 
   onScroll(e){
     this.totalinput = this.total;
     setTimeout(() => {
       this.page = parseInt(this.page) + 1;
       this.listData();
     }, 500);
   }
 
   async downloadexcel(){
     var header = ['IP Address', 'Perangkat', 'Tanggal']
     this.excel.generateExcel('Data Pengunjung Website', 'Pengunjung', header, this.isidata)
   }


}
