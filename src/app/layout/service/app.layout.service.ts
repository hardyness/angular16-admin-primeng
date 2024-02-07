import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {

    config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 12,
    };

    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    private configUpdate = new Subject<AppConfig>();

    private overlayOpen = new Subject<any>();

    private emittersearch = new BehaviorSubject<any>('');

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    emittersearch$ = this.emittersearch.asObservable();

    cari: any = '';

    constructor() {
      const page_s = localStorage.getItem('search_history')  || '{}';
      const page_v = JSON.parse(page_s);
      if (page_s !== '{}'){
        this.cari = page_v.cari;
      }
      else {
        this.cari = '';
      }
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
        }
        else {
            this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    isOverlay() {
        return this.config.menuMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this.configUpdate.next(this.config);
    }

    search(e){
      this.cari = e;
      if (this.cari === '' || undefined){
        const page_s = localStorage.getItem('search_history');
        const page_v = JSON.parse(page_s);
        if (page_v !== null){
          this.emitSearch();
        }
        else {
          this.cari = '';
        }

      };
    }

    async emitSearch(){
      var dataPage = {
        cari: this.cari,
      }
      await localStorage.setItem('search_history', JSON.stringify(dataPage));
      if (this.cari !== '' || undefined){
        this.emittersearch.next(this.cari);
      }
      else {
        this.cari = '';
        this.emittersearch.next(this.cari);
        localStorage.removeItem('search_history')
      }
    }

    async resetSearch(){
      this.cari = '';
      this.emitSearch();
    }

  }
