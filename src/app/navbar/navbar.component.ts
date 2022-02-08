import { Component, OnInit, Input } from '@angular/core';
import { User } from '../users/user';
import { UserContext } from '../users/usercontext';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

/**
 * This component represents a navbar used throughout the application
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  /**
   * This should be set to true if you want to hide the nav links
   */
  @Input() hideLinks = false;
  /**
   * The name of the url to be active
   */
  @Input() active = '';
  /**
   * This determines if the navbar should be "sticky"
   */
  @Input() sticky = true;
  /**
   * The user to display on the navbar
   */
  user: User;
  /**
   * An error message
   */
  error: string;

  constructor(private userContext: UserContext, private modalService: NgbModal) { }

  ngOnInit() {
    if (!this.hideLinks) {
      this.userContext.getUser().subscribe({
        next: user => this.user = user,
        error: e => {
          this.error = e;
          this.openError();
        }
      });
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
