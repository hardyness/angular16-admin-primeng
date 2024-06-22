import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

const sesilogin = 'wh_login_proto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private key: string;

  constructor(
    public router: Router,
  ) { 
    this.key = 'wh-AES-secrt-key-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  }


  async login(data){
    this.isAuthenticated.next(true);
    localStorage.setItem(sesilogin, data);
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
