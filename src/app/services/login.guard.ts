import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, from, mergeMap } from 'rxjs';
import { AuthService } from './auth.service';

const sesilogin = 'wh_login_proto';

@Injectable({
  providedIn: 'root'
})

export class LoginGuard  {

  constructor(private router: Router) { }
  async canActivate(): Promise<boolean> {
    const data = localStorage.getItem(sesilogin);
    if (data !== null) {
      this.router.navigate(['/suplier?p=1']);
      return false;
    }
    else {
      return true;
    }
  }

}