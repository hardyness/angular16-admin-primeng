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
          setTimeout(() => {
            this.sch = localStorage.getItem('schstatus');
            var header = localStorage.getItem('headertext');
            this.titlepage = header;
          }, 300);
        });
     }

     private getPageTitle(url: string): string {
      const pathSegments = this.location.path().split('/').filter(Boolean);
      const queryParams = new URLSearchParams(url.split('?')[1]);
      const firstSegment = pathSegments[0]?.charAt(0).toUpperCase() + pathSegments[0]?.slice(1);
      const secondSegment = this.removeDash(pathSegments[1]);
      const titleSegments = [firstSegment, secondSegment].filter(Boolean);
      return titleSegments.join(' - ');
    }

    private removeDash(text: string): any {
      if (text !== undefined){
        return text.split('-')
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
      }
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
