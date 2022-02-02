import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { AuthService } from './authentication/auth.service';
import { LoginComponent } from './authentication/login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { EmailConfirmationComponent } from './authentication/email-confirmation/email-confirmation.component';
import { AlertComponent } from './alert/alert.component';
import { NeedsConfirmationComponent } from './authentication/email-confirmation/needs-confirmation.component';
import { TooltipDirective } from './tooltip.directive';
import { UserService } from './users/user.service';
import { JWTStore } from './authentication/jwtstore';
import { AuthInterceptor } from './authentication/authinterceptor';
import { LogoutComponent } from './authentication/logout/logout.component';
import { CenterBoxDirective } from './center-box.directive';
import { CenterHeaderComponent } from './center-header/center-header.component';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { UserRedirectComponent } from './users/user-redirect/user-redirect.component';
import { FieldErrorComponent } from './field-error/field-error.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    NotFoundComponent,
    RegistrationComponent,
    EmailConfirmationComponent,
    AlertComponent,
    NeedsConfirmationComponent,
    TooltipDirective,
    LogoutComponent,
    CenterBoxDirective,
    CenterHeaderComponent,
    CreateUserComponent,
    UserRedirectComponent,
    FieldErrorComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    UserService,
    JWTStore,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
