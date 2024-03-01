import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { catchError, map, tap, timeInterval, timeout,  } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

const sesilogin = 'masterkbmv4_login';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  server: string = "http://192.168.1.22:9000/master/";
  // server: string = "http://localhost:9000/master/";
  forbiddenWords = ['Kunyuk','Bajingan','Asu','Bangsat','Kampret','Kontol','Memek','Ngentot','Pentil','Perek','Pepek','Pecun','Bencong','Banci','Maho','Gila','Sinting','Tolol','Sarap','Setan','Lonte','Hencet','Taptei','Kampang','Pilat','Keparat','Bejad','Gembel','Brengsek','Tai','Anjrit','Bangsat','Fuck','Tetek','Ngulum','Jembut','Totong','Kolop','Pukimak','Bodat','Heang','Jancuk','Burit','Titit','Nenen','Bejat','Silit','Sempak','Fucking','Asshole','Bitch','Penis','Vagina','Klitoris','Kelentit','Borjong','Dancuk','Pantek','Taek','Itil','Teho','Bejat','Pantat','Bagudung','Babami','Kanciang','Bungul','Idiot','Kimak','Henceut','Kacuk','Blowjob','Pussy','Dick','Damn','Ass', 'Goblok', 'jalil'];

  

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    public router: Router,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
    private location: Location
  ) { }

  postData(parameter, file, {headers}): Observable<any> {
    return this.http.post(this.server + file, parameter, {headers}).pipe(
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
    const sesi = localStorage.getItem(sesilogin);
    const sesivalue = JSON.parse(sesi);
    console.log('Terjadi kesalahan (Error Found)', err)
    if (status == 401){
      const data = {
        sesiidlogin: sesivalue.sesiidlogin,
        sesiusername: sesivalue.sesiusername,
        sesinama: sesivalue.sesinama,
        sesilevel: sesivalue.sesilevel,
        sesitoken: isiError.token,
        sesiunik: sesivalue.sesiunik,
      }
      localStorage.setItem(sesilogin, JSON.stringify(data));
    } 
    else if (status == 403){
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
