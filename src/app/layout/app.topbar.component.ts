import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { LayoutService } from "./service/app.layout.service";
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, first } from 'rxjs';

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

    @ViewChild('searchInput') searchInput!: ElementRef;

    constructor(
      public layoutService: LayoutService,
      public auth: AuthService,
      public actRoute: ActivatedRoute,
      private router: Router,
      private location: Location,
      private confirmationService: ConfirmationService,
    ) {    
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((val: NavigationEnd) => {
        this.items_ar = [];
        let teksHasil = val.url.slice(1).charAt(0).toUpperCase() + val.url.slice(2);
        this.titlepage = teksHasil;
        this.items_ar.push({label: this.titlepage});
        this.items = this.items_ar;
        console.log(this.titlepage);
      });
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
