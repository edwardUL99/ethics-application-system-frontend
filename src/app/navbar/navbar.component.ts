import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { UserContext } from '../users/usercontext';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../users/authorization.service';
import { User } from '../users/user';

/**
 * This component represents a navbar used throughout the application
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  /**
   * This should be set to true if you want to hide the nav links
   */
  @Input() hideLinks = false;
  /**
   * Use this to indicate if profile should be shown
   */
  @Input() displayProfile = false;
  /**
   * This determines if the navbar should be "sticky"
   */
  @Input() sticky = true;
  /**
   * The username of the user to display on the navbar
   */
  username: string;
  /**
   * The name of the user to display on the navbar
   */
  name: string;
  /**
   * An error message
   */
  error: string;
  /**
   * Determines if the user can export applications
   */
  canExport: boolean;
  /**
   * The subscription for retrieving a user
   */
  private userSubscription: Subscription;
  /**
   * A subscription to the user context
   */
  private contextSubscription: Subscription;

  constructor(private userContext: UserContext, private modalService: NgbModal,
    private authorizationService: AuthorizationService) {
    this.contextSubscription = this.userContext.subscribeToUpdates({
      next: () => {
        this.username = this.userContext.getUsername();
        this.name = this.userContext.getName();
      },
    });
  }

  ngOnInit() {
    if (!this.hideLinks) {
      try {
        this.userSubscription = this.userContext.getUser().subscribe({
          next: user => {
            this.username = user.username;
            this.name = user.name;
            this.displayProfile = this.username != undefined && this.name != undefined;
            this.checkExport(user);
          },
          error: e => {
            this.error = e;
            this.openError();
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  private checkExport(user: User) {
    this.authorizationService.authorizeUserPermissions(user, ['EXPORT_APPLICATIONS'], true)
      .subscribe({
        next: response => this.canExport = response,
        error: e => {
          console.log(e);
          this.openError();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private openError() {
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.title = 'Error Occurred';
    modalRef.componentInstance.content = this.error;
    modalRef.componentInstance.redirectLink = 'logout';
    modalRef.componentInstance.redirectText = 'Go to login';
  }
}
