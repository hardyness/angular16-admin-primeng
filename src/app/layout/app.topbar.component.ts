import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { LayoutService } from "./service/app.layout.service";
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, first } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { ApiService } from '../services/api.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    // items!: MenuItem[];
    scrWidth:any;
    @HostListener('window:resize', ['$event'])
    async getScreenSize(event?) {
      this.scrWidth = window.innerWidth;
    }
    title: any;
    sch: any;
    search: any;
    urlnow: any;
    titlepage: any;
    showfullSearch: boolean = false;

    items: MenuItem[] | undefined;
    items_ar: any[] = [];

    home: MenuItem | undefined;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
      public layoutService: LayoutService,
      public auth: AuthService,
      public actRoute: ActivatedRoute,
      private router: Router,
      private location: Location,
      private confirmationService: ConfirmationService,
      private api: ApiService,
    ) {    
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((val: NavigationEnd) => {
          setTimeout(() => {
            this.sch = localStorage.getItem('schstatus');
            var header = localStorage.getItem('headertext');
            this.titlepage = header;
          }, 300);
        });
        const sesi = localStorage.getItem(this.api.sesilogin);
        this.decrypt(sesi)
     }

     async decrypt(data: string) {
      const bytes = CryptoJS.AES.decrypt(data,'wh-AES-secrt-key-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
      const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      this.title = decrypted.nama;
      return decrypted;
    }

    async ngOnInit() {
      await this.getScreenSize();
    }

    async logout(){
      this.konfirmLogout()
    }

    async konfirmLogout(){
      this.confirmationService.confirm({
        header: 'Yakin ingin keluar?',
        message: 'Anda akan dialihkan ke halaman login ',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        acceptLabel: 'Keluar',
        rejectLabel: 'Batal',
        acceptButtonStyleClass:"p-button-danger",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.auth.logout()
        },
        reject: () => {
        }
      });
    }
}
