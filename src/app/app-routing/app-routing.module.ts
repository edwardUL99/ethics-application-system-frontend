import { NgModule, Type } from '@angular/core';
import { Routes, RouterModule, CanDeactivate, CanActivate } from '@angular/router';
import { LoginComponent } from '../authentication/login/login.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { IndexRedirectComponent } from '../index-redirect/index-redirect.component';
import { RegistrationComponent } from '../authentication/registration/registration.component';
import { EmailConfirmationComponent } from '../authentication/email-confirmation/email-confirmation.component';
import { NeedsConfirmationComponent } from '../authentication/email-confirmation/needs-confirmation.component';
import { LogoutComponent } from '../authentication/logout/logout.component';
import { UserRedirectComponent } from '../users/user-redirect/user-redirect.component';
import { CreateUserComponent } from '../users/create-user/create-user.component';
import { ApplicationDisplayComponent } from '../applications/view/application-display/application-display.component';
import { PendingChangesGuard } from '../pending-changes/pendingchangesguard';
import { ApplicationListComponent } from '../applications/view/application-list/application-list.component';
import { AuthGuard } from '../authentication/authguard';
import { HomeComponent } from '../home/home.component';
import { ForgotPasswordComponent } from '../authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../authentication/reset-password/reset-password.component';
import { UserSearchPageComponent } from '../users/search/user-search-page/user-search-page.component';
import { UserProfileComponent } from '../users/user-profile/user-profile.component';
import { ExportDownloaderComponent } from '../exporter/export-downloader/export-downloader.component';
import { ExportComponent } from '../exporter/export/export.component';
import { RequestsListComponent } from '../applications/view/answer-requests/requests-list/requests-list.component';
import { AnswerRequestComponent } from '../applications/view/answer-requests/answer-request/answer-request.component';

function createRoute(path: string, component: Type<any>, canDeactivate?: Type<CanDeactivate<any>>[], canActivate?: Type<CanActivate>[], pathMatch?: string) {
    const route = {path: path, component: component};

    if (canDeactivate) {
        route['canDeactivate'] = canDeactivate;
    }

    if (canActivate) {
        route['canActivate'] = canActivate;
    }

    route['pathMatch'] = pathMatch;

    return route;
}

const routes: Routes = [
    createRoute('login', LoginComponent),
    createRoute('logout', LogoutComponent),
    createRoute('login-redirect', LogoutComponent),
    createRoute('register', RegistrationComponent),
    createRoute('user-redirect', UserRedirectComponent),
    createRoute('needs-confirm', NeedsConfirmationComponent, undefined),
    createRoute('confirm-account', EmailConfirmationComponent),
    createRoute('create-user', CreateUserComponent, undefined, [AuthGuard]),
    createRoute('application', ApplicationDisplayComponent, [PendingChangesGuard], [AuthGuard]),
    createRoute('applications', ApplicationListComponent, undefined, [AuthGuard]),
    createRoute('home', HomeComponent, undefined, [AuthGuard]),
    createRoute('forgot-password', ForgotPasswordComponent, undefined, undefined),
    createRoute('reset-password', ResetPasswordComponent, undefined, undefined),
    createRoute('user-search', UserSearchPageComponent, undefined, [AuthGuard]),
    createRoute('profile', UserProfileComponent, undefined, [AuthGuard]),
    createRoute('export-downloader', ExportDownloaderComponent, undefined, [AuthGuard]),
    createRoute('export', ExportComponent, undefined, [AuthGuard]),
    createRoute('answer-requests', RequestsListComponent, undefined, [AuthGuard]),
    createRoute('answer-request', AnswerRequestComponent, undefined, [AuthGuard]),
    createRoute('', IndexRedirectComponent, undefined, undefined, 'full'),
    createRoute('**', NotFoundComponent)
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
