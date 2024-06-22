import { LOCALE_ID, NgModule } from '@angular/core';
import { PathLocationStrategy, LocationStrategy, registerLocaleData } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { LoginModule } from './login/login.module';
import { PrimekitModule } from './services/primekit/primekit.module';
import { TranslateModule } from '@ngx-translate/core';
import localeId from '@angular/common/locales/id';

registerLocaleData(localeId);

@NgModule({
    declarations: [
        AppComponent, NotfoundComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        LoginModule,
        PrimekitModule,
        TranslateModule.forRoot()
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy},
        { provide: LOCALE_ID, useValue: 'id-ID' },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
