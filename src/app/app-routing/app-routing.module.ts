import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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

const routes: Routes = [
{ path: 'login', component: LoginComponent },
{ path: 'logout', component: LogoutComponent },
{ path: 'register', component: RegistrationComponent },
{ path: 'user-redirect', component: UserRedirectComponent },
{ path: 'needs-confirm', component: NeedsConfirmationComponent },
{ path: 'confirm-account', component: EmailConfirmationComponent },
{ path: 'create-user', component: CreateUserComponent },
{ path: 'application', component: ApplicationDisplayComponent, canDeactivate: [PendingChangesGuard] },
{ path: 'applications', component: ApplicationListComponent },
{ path: '', component: AppComponent },
{ path: '**', component: NotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}
