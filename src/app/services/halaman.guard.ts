import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, from, mergeMap } from 'rxjs';
import { AuthService } from './auth.service';

const sesilogin = 'masterkbmv4_login';

@Injectable({
  providedIn: 'root'
})

export class HalamanGuard  {

  constructor(private router: Router) { }
  async canActivate(): Promise<boolean> {
    const session = await JSON.parse(localStorage.getItem(sesilogin));
    if (session == null) {
      this.router.navigate(['/login']);
      return false;
    }
    else {
      return true;
    }
  }

}