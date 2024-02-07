import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

const sesilogin = 'masterkbmv4_login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public router: Router,
  ) { }


  async login(idlogin, username, nama, token, unik){
    this.isAuthenticated.next(true);
    const data = {
      sesiidlogin: idlogin,
      sesiusername: username,
      sesinama: nama,
      sesitoken: token,
      sesiunik: unik
    };
    localStorage.setItem(sesilogin, JSON.stringify(data));
  }

  async logout(){
    const el = document.getElementById('nb-global-spinner');
    if (el) {
      el.style['display'] = 'flex';
    };
    this.isAuthenticated.next(false);
    this.hapuskey();
    this.router.navigate(['/login']);
    setTimeout(() => {
      if (el) {
        el.style['display'] = 'none';
      };
    }, 500);
  }

  async hapuskey(){
    localStorage.clear()
  }
}
