import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RippleModule } from 'primeng/ripple';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigModule } from './config/config.module';
import { AppSidebarComponent } from "./app.sidebar.component";
import { AppLayoutComponent } from "./app.layout.component";
import { ConfirmationService, MessageService } from 'primeng/api';
import { CustomautofocusModule } from '../services/customautofocus/customautofocus.module';
import { PrimekitModule } from '../services/primekit/primekit.module';
import { MenuService } from './app.menu.service';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        RippleModule,
        RouterModule,
        PrimekitModule,
        CustomautofocusModule,
        AppConfigModule
    ],
    exports: [AppLayoutComponent],
    providers: [MessageService, ConfirmationService, MenuService]
})
export class AppLayoutModule { }
