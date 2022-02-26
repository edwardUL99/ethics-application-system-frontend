import { NgModule, Type } from '@angular/core';
import { Routes, RouterModule, CanDeactivate, CanActivate } from '@angular/router';
import { LoginComponent } from '../authentication/login/login.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { AppComponent } from '../app.component';
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


function createRoute(path: string, component: Type<any>, canDeactivate?: Type<CanDeactivate<any>>[], canActivate?: Type<CanActivate>[]) {
    const route = {path: path, component: component};

    if (canDeactivate) {
        route['canDeactivate'] = canDeactivate;
    }

    if (canActivate) {
        route['canActivate'] = canActivate;
    }

    return route;
}

const routes: Routes = [
    createRoute('login', LoginComponent),
    createRoute('logout', LogoutComponent),
    createRoute('register', RegistrationComponent),
    createRoute('user-redirect', UserRedirectComponent),
    createRoute('needs-confirm', NeedsConfirmationComponent, undefined, [AuthGuard]),
    createRoute('confirm-account', EmailConfirmationComponent),
    createRoute('create-user', CreateUserComponent, undefined, [AuthGuard]),
    createRoute('application', ApplicationDisplayComponent, [PendingChangesGuard], [AuthGuard]),
    createRoute('applications', ApplicationListComponent, undefined, [AuthGuard]),
    createRoute('', AppComponent),
    createRoute('**', NotFoundComponent)
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}
