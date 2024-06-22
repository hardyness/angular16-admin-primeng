import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];
  ms: any;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private api: ApiService,
    ) { 
    }

  ngOnInit() {
    this.listMenu();
  }

  async listMenu(): Promise<void> {
    const query = {
      halaman: '1',
      totaltampil: '20',
      od: '',
      dr: 'true',
    };

    try {
      const res: any = await this.api.getData("listmenu", { query }).toPromise();
      if (res.status == 99) {
        this.model = res.hasil;
      }
    } catch (err) {
      console.error(err);
    }
  }

}
