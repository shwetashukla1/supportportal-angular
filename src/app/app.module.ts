import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { NotificationModule } from './notification.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationService } from './service/authentication.service';
import { UserService } from './service/user.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthenticationGuard } from './guard/authentication.guard';
import { RegisterComponent } from './component/register/register.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './component/login/login.component';
import { UserComponent } from './component/user/user.component';
import { ProfileComponent } from './component/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    UserComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NotificationModule
  ],
  providers: [AuthenticationGuard, AuthenticationService, UserService, 
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
