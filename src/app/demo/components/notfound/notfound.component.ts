import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
})
export class NotfoundComponent { 
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.setCustomtitle('404 - Halaman tidak ditemukan')
  }
}