import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, from, mergeMap } from 'rxjs';
import { AuthService } from './auth.service';
const sesilogin = 'wh_login_proto';

@Injectable({
  providedIn: 'root'
})

export class HalamanGuard  {

  constructor(private router: Router) { }
  async canActivate(): Promise<boolean> {
    const data = await localStorage.getItem(sesilogin);
    if (data == null) {
      this.router.navigate(['/login']);
      return false;
    }
    else {
      return true;
    }
  }

}