import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimekitModule } from '../services/primekit/primekit.module';
import { LoginRoutingModule } from './login-routing.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../services/api.service'

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PrimekitModule
  ],
  providers: [MessageService, ConfirmationService, ApiService]
})
export class LoginModule { }
