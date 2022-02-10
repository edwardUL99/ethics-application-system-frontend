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
import { SectionViewComponent } from './applications/view/component/section-view/section-view.component';
import { ComponentHostDirective } from './applications/view/component/component-host.directive';
import { ContainerViewComponent } from './applications/view/component/container-view/container-view.component';
import { TextViewComponent } from './applications/view/component/text-view/text-view.component';
import { TextQuestionViewComponent } from './applications/view/component/text-question-view/text-question-view.component';
import { SelectQuestionViewComponent } from './applications/view/component/select-question-view/select-question-view.component';
import { CheckboxGroupViewComponent } from './applications/view/component/checkbox-group-view/checkbox-group-view.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './modal/modal.component';
import { UserContext } from './users/usercontext';
import { CheckboxQuestionViewComponent } from './applications/view/component/checkbox-question-view/checkbox-question-view.component';
import { RadioQuestionViewComponent } from './applications/view/component/radio-question-view/radio-question-view.component';
import { MultipartQuestionViewComponent } from './applications/view/component/multipart-question-view/multipart-question-view.component';
import { ApplicationTemplateService } from './applications/application-template.service';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { SignatureQuestionViewComponent } from './applications/view/component/signature-question-view/signature-question-view.component'
import { SignatureFieldComponent } from './applications/view/component/signature-question-view/signature-field/signature-field.component';

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
    FieldErrorComponent,
    SectionViewComponent,
    ComponentHostDirective,
    ContainerViewComponent,
    TextViewComponent,
    TextQuestionViewComponent,
    SelectQuestionViewComponent,
    CheckboxGroupViewComponent,
    ModalComponent,
    CheckboxQuestionViewComponent,
    RadioQuestionViewComponent,
    MultipartQuestionViewComponent,
    SignatureQuestionViewComponent,
    SignatureFieldComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    AngularSignaturePadModule
  ],
  providers: [
    AuthService,
    UserService,
    JWTStore,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    UserContext,
    ApplicationTemplateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
