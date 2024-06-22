import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { Password } from 'primeng/password';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    `
      :host ::ng-deep .pi-eye,
      :host ::ng-deep .pi-eye-slash {
        transform: scale(1.6);
        margin-right: 1rem;
        color: var(--primary-color) !important;
      }
    `,
  ],
})
export class LoginComponent {
  @ViewChild('passWord') passWord: Password;
  titleHalaman = 'Login Master - Warehouse (proto)';
  valCheck: string[] = ['remember'];

  username: '';
  password: '';
  formLogin: FormGroup;

  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    null
  );
  showPassword = false;
  formAdmin: FormGroup;
  errors: string[] = [];
  messages: string[] = [];
  user: any = {};
  submitted: boolean = false;
  rememberMe = true;
  loading = false;
  loadingButton = false;
  load: any[] = [];
  pageSukses = false;
  pageGagal = false;

  constructor(
    public layoutService: LayoutService,
    private Api: ApiService,
    private route: Router,
    private fb: FormBuilder,
    private Auth: AuthService,
    private message: MessageService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(this.titleHalaman);
    this.formLogin = this.fb.group({
      nama: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngAfterViewChecked() {
    this.passWord.input.nativeElement.autocomplete = 'current-password';
  }

  async pesanToast(severity, pesan, detail){
    this.message.add({
      severity: severity,
      summary: pesan,
      detail: detail
    })
  }

  async login() {
    const el = document.getElementById('nb-global-spinner');
    if (el) {
      el.style['display'] = 'flex';
    }
    this.loadingButton = true;
    try {
      if (!this.formLogin.valid) {
        this.loadingButton = false;
      }
      else {
        const username: any = this.formLogin.value.nama;
        const password: any = this.formLogin.value.password;
    
        const parameter = new FormData();
        const headers = new HttpHeaders({
          'device': '12345',
        });
    
        parameter.append('username', username);
        parameter.append('password', password);
    
        const res: any = await this.Api.postData(parameter, 'akun/login', { headers }).toPromise();
        if (el) {
          el.style['display'] = 'none';
        }
        if (res.status === 1) {
          this.pesanToast('error', res.pesan, 'Username/Password Salah!');
        } else if (res.status === 99) {
          this.pesanToast('success', res.pesan, '');
          this.Auth.login(res.data)
          this.route.navigateByUrl('/suplier?p=1');
        }
      }

    } catch (err) {
      if (el) {
        el.style['display'] = 'none';
      }
      this.loadingButton = false;
  
      if (err.status === 403) {
        this.Api.error(err);
      } else {
        this.Api.error(err);
        this.gagalPost(1, '');
      }
    } finally {
      if (el) {
        el.style['display'] = 'none';
      }
      this.loadingButton = false;
    }
  }


  async gagalPost(tipe, id) {
    var gagal = [{
      tipe: tipe,
      id: id,
    }];
    this.load = gagal;
    if (tipe == 1){
      this.pageGagal = true;
      this.pageSukses = false;
    }
  }

  async reload(param, id){
    if (param == 1) {
      this.pageGagal = false;
      this.login();
    }
  }
}
