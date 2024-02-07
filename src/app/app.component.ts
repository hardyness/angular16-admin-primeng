import { Component, HostListener, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    script = document.createElement('script');

    constructor(private primengConfig: PrimeNGConfig) { }

    async ngOnInit() {
      await this.loadmap();
      this.primengConfig.ripple = true;
      this.primengConfig.ripple = true;
      setTimeout(() => {
          const el = document.getElementById('nb-global-spinner');
          if (el) {
            el.style['display'] = 'none';
          };
      })
    }

    async loadmap(){
      this.script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyADZdxhc_-i2sO5woEmcKvhXhhLvxxLAig';
      this.script.async = true;
      document.head.appendChild(this.script);
    }
}
