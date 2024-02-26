import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-halaman',
  templateUrl: './halaman.component.html',
  styleUrls: ['./halaman.component.scss']
})
export class HalamanComponent {

  constructor(
    private primengConfig: PrimeNGConfig,
    public translate: TranslateService
  ) {
    translate.addLangs(['id']);
    translate.setDefaultLang('id');
    this.translate.stream('primeng').subscribe(data => {
      this.primengConfig.setTranslation(data);
    });
  }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }
}
