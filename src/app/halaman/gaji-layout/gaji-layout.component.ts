import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-gaji-layout',
  templateUrl: './gaji-layout.component.html',
  styleUrls: ['./gaji-layout.component.scss']
})
export class GajiLayoutComponent {

  constructor(
    private api : ApiService
  ){}

  ngOnInit(): void {
    this.api.setHeader('Gaji Layout');
  }
}
