import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { timeout, map, retry,} from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private key: string;
  sesilogin = 'wh_login_proto';
  server: string = "http://192.168.0.102:9000/master/";
  // server: string = "http://localhost:9000/master/";
  forbiddenWords = ['Kunyuk','Bajingan','Asu','Bangsat','Kampret','Kontol','Memek','Ngentot','Pentil','Perek','Pepek','Pecun','Bencong','Banci','Maho','Gila','Sinting','Tolol','Sarap','Setan','Lonte','Hencet','Taptei','Kampang','Pilat','Keparat','Bejad','Gembel','Brengsek','Tai','Anjrit','Bangsat','Fuck','Tetek','Ngulum','Jembut','Totong','Kolop','Pukimak','Bodat','Heang','Jancuk','Burit','Titit','Nenen','Bejat','Silit','Sempak','Fucking','Asshole','Bitch','Penis','Vagina','Klitoris','Kelentit','Borjong','Dancuk','Pantek','Taek','Itil','Teho','Bejat','Pantat','Bagudung','Babami','Kanciang','Bungul','Idiot','Kimak','Henceut','Kacuk','Blowjob','Pussy','Dick','Damn','Ass', 'Goblok', 'jalil'];

  dataEncrypt: any;

  

  constructor(
  private http: HttpClient,
  private auth: AuthService,
  public router: Router,
  public messageService: MessageService,
  private confirmationService: ConfirmationService,
  private title: Title,
  private location: Location
  ) { 
    this.key = 'wh-AES-secrt-key-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  }
  

  postData(parameter, endpoint, {headers}, queryParams?: any): Observable<any> {
    let url = this.server + endpoint;
    if (queryParams) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
    }
    return this.http.post(url, parameter, {headers}).pipe(
      map(res => res),
      timeout(15000),
      retry(1)
    );
  }

  getData(endpoint, queryParams?: any): Observable<any> {
  let url = this.server + endpoint;

  if (queryParams) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
  }
  return this.http.get(url).pipe(
      map(res => res),
      timeout(15000),
  );
  }

  async konfirmAkses(status){
  this.confirmationService.confirm({
      message: 'Akses anda ditolak, silahkan kembali ke halaman login!',
      header: 'Status koneksi ' + status,
      icon: 'pi pi-exclamation-triangle',
      closeOnEscape: false,
      dismissableMask: false,
      acceptLabel: 'Kembali ke login',
      accept: () => {
    this.auth.logout();
      },
  })
  }

  async error(err){
  const isiError = err.error;
  const status = err.status;
  const sesi = localStorage.getItem(this.sesilogin);
  const bytes = CryptoJS.AES.decrypt(sesi, this.key);
  const sesivalue = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log('Terjadi kesalahan (Error Found)', err, status);
  console.log(sesivalue);
  if (status == 401){
    const data = {
    idakun: sesivalue.idakun,
    username: sesivalue.username,
    nama: sesivalue.nama,
    level: sesivalue.level,
    token: isiError.newtoken,
      }
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.key).toString();
      localStorage.setItem(this.sesilogin, encrypted);
  } 
  else 
  if (status == 403){
      this.konfirmAkses(status);
      this.setCustomtitle('Terjadi Kesalahan!');
  } 
  else if (status == 500){
      this.messageService.add({severity: 'error', summary: isiError.pesan});
      this.setCustomtitle('Terjadi Kesalahan!');
  } 
  else if (status == 0){
      this.messageService.add({severity: 'error', summary: 'Opps, koneksi ke server bermasalah!'});
      this.setCustomtitle('Koneksi Bermasalah!');
  } 
  else if (status == 404){
      this.messageService.add({severity: 'error', summary: 'Halaman tidak ada!'});
      this.router.navigate(['/notfound']);
      this.setCustomtitle('Not Found 404');
  }
  else {
      this.messageService.add({severity: 'error', summary: 'Opps, Terjadi Kesalahan!'});
      this.setCustomtitle('Terjadi Kesalahan!');
  }
  }

  kataKasar(str: string, dt = this.forbiddenWords): boolean {
  if (str) {
      const lowerCaseStr = str.toLowerCase();
      return dt.some(word => lowerCaseStr.includes(word.toLowerCase()));
  } else {
      return false;
  }
  }

  setTitle(){
  const url = this.getCurrentUrl();
  const segments = url.split('/');
  const lastSegment = segments[segments.length - 1];
  const words = lastSegment.split('-');
  const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  this.title.setTitle(formattedWords + ' | KBM Master');
  }

  setCustomtitle(t){
  this.title.setTitle(t)
  }

  setHeader(t){
  localStorage.setItem('headertext', t)
  }

  getCurrentUrl(): string {
  return this.location.path();
  }

}
