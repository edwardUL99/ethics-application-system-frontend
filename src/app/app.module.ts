import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
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
import { QuestionTableViewComponent } from './applications/view/component/question-table-view/question-table-view.component';
import { DynamicComponentLoader } from './applications/view/component/dynamiccomponents';
import { ApplicationTemplateDisplayComponent } from './applications/view/application-template-display/application-template-display.component';
import { InjectorService } from './injector.service';
import { ApplicationService } from './applications/application.service';
import { ApplicationContext } from './applications/applicationcontext';
import { AnswerViewComponent } from './applications/view/answer-view/answer-view.component';
import { CacheManager } from './caching/cachemanager';
import { CachingInterceptor } from './caching/interceptor';
import { ApplicationDisplayComponent } from './applications/view/application-display/application-display.component';
import { FakeInterceptor } from './testing/fakeinterceptor';
import { PendingChangesGuard } from './pending-changes/pendingchangesguard';
import { LoadingComponent } from './loading/loading.component';
import { ApplicationListComponent } from './applications/view/application-list/application-list.component';
import { AuthorizationService } from './users/authorization.service';
import { ReferMarkerComponent } from './applications/view/refer-marker/refer-marker.component';
import { CommentDisplayComponent } from './applications/view/comment-display/comment-display.component';
import { AuthGuard } from './authentication/authguard';
import { IndexRedirectComponent } from './index-redirect/index-redirect.component';
import { HomeComponent } from './home/home.component';
import { ApiInterceptor } from './api-interceptor/api-interceptor';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { SearchService } from './search/search.service';
import { ApplicationSearchComponent } from './applications/search/application-search/application-search.component';
import { SearchControlComponent } from './search/search-control/search-control.component';
import { UserSearchComponent } from './users/search/user-search/user-search.component';
import { UserQueryService } from './users/search/user-query.service';
import { UserSearchPageComponent } from './users/search/user-search-page/user-search-page.component';
import { UserProfileComponent } from './users/user-profile/user-profile.component';
import { FilesService } from './files/files.service';
import { AttachmentModalComponent } from './applications/view/attachments/attachment-modal/attachment-modal.component';
import { AttachmentsComponent } from './applications/view/attachments/attachments/attachments.component';
import { CommentsDisplayComponent } from './applications/view/comments-display/comments-display.component';
import { AssignedUsersComponent } from './applications/view/assigned-users/assigned-users.component';
import { ApplicationResultsComponent } from './applications/search/application-results/application-results.component';
import { ExporterService } from './exporter/exporter.service';
import { ExportDownloaderComponent } from './exporter/export-downloader/export-downloader.component';
import { ExportComponent } from './exporter/export/export.component';
import { ResultsOperatorComponent } from './search/results-operator/results-operator.component';
import { AnswerRequestComponent } from './applications/view/answer-requests/answer-request/answer-request.component';
import { AnswerRequestContextComponent } from './applications/view/answer-requests/answer-request-context/answer-request-context.component';
import { AnswerRequestService } from './applications/answer-request.service';
import { RequestsListComponent } from './applications/view/answer-requests/requests-list/requests-list.component';
import { RequestComponentAnswerComponent } from './applications/view/answer-requests/request-component-answer/request-component-answer.component';
import { RequiredIndicatorComponent } from './applications/view/required-indicator/required-indicator.component';

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
    SignatureFieldComponent,
    QuestionTableViewComponent,
    ApplicationTemplateDisplayComponent,
    AnswerViewComponent,
    ApplicationDisplayComponent,
    LoadingComponent,
    ApplicationListComponent,
    ReferMarkerComponent,
    CommentsDisplayComponent,
    CommentDisplayComponent,
    IndexRedirectComponent,
    HomeComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ApplicationSearchComponent,
    SearchControlComponent,
    UserSearchComponent,
    UserSearchPageComponent,
    UserProfileComponent,
    AttachmentModalComponent,
    AttachmentsComponent,
    AssignedUsersComponent,
    ApplicationResultsComponent,
    ExportDownloaderComponent,
    ExportComponent,
    ResultsOperatorComponent,
    AnswerRequestComponent,
    AnswerRequestContextComponent,
    RequestsListComponent,
    RequestComponentAnswerComponent,
    RequiredIndicatorComponent
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FakeInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CachingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    UserContext,
    ApplicationTemplateService,
    DynamicComponentLoader,
    ApplicationService,
    ApplicationContext,
    CacheManager,
    PendingChangesGuard,
    AuthorizationService,
    AuthGuard,
    SearchService,
    UserQueryService,
    FilesService,
    ExporterService,
    AnswerRequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    InjectorService.initialise(this.injector);
  }
}
