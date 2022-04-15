import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { AuthorizationService } from '../../../users/authorization.service';
import { shortResponseToUserMapper, UserResponseShortened } from '../../../users/responses/userresponseshortened';
import { User } from '../../../users/user';
import { ApplicationService } from '../../application.service';
import { ViewingUser } from '../../applicationcontext';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { AssignedCommitteeMember } from '../../models/applications/assignedcommitteemember';
import { resolveStatus } from '../../models/requests/mapping/applicationmapper';

/**
 * This is a utility class that represents a committee member that can be assigned to the application
 */
export class AssignableUser {
  /**
   * The shortened response representing the user
   */
  user: UserResponseShortened;
  /**
   * This value is true if the user was assigned to the application but it had been referred and resubmitted back to the committee
   */
  previouslyAssigned: boolean;

  /**
   * Create an instance
   * @param user the user information
   * @param previouslyAssigned true if previosuly assigned to the application, false if not
   */
  constructor(user: UserResponseShortened, previouslyAssigned: boolean) {
    this.user = user;
    this.previouslyAssigned = previouslyAssigned;
  }
}

@Component({
  selector: 'app-assigned-users',
  templateUrl: './assigned-users.component.html',
  styleUrls: ['./assigned-users.component.css']
})
export class AssignedUsersComponent implements OnInit, OnChanges {
  /**
   * The application to retrieve assigned committee members from
   */
  @Input() application: Application;
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;
  /**
   * If this is set to true, rather than assigning users to the aplication on Assign clicked, the values are simply emitted
   */
  @Input() acceptReferredAssign: boolean;
  /**
   * Determines if the viewing user is an admin
   */
  isAdmin: boolean;
  /**
   * Determine if the panel is displayed
   */
  displayed: boolean;
  /**
   * The alert to display messages
   */
  @ViewChild('assignAlert')
  assignAlert: AlertComponent;
  /**
   * Emits list of assigned users if the acceptReferredAssign value is set to true
   */
  @Output() assignedUsers: EventEmitter<string[]> = new EventEmitter<string[]>();
  /**
   * Emits an event when a committee member is unassigned
   */
  @Output() unassigned: EventEmitter<AssignedCommitteeMember> = new EventEmitter<AssignedCommitteeMember>();
  /**
   * The form group to assign the form to a committee member
   */
  assignForm: FormGroup;
  /**
   * The observable retrieving users that can review applications
   */
  committeeMembers: AssignableUser[];
  /**
   * Determine if the component should be disabled or not
   */
  disable: boolean = false;

  constructor(private router: Router, private applicationService: ApplicationService,
    private fb: FormBuilder,
    private authorizationService: AuthorizationService) {
      this.assignForm = this.fb.group({
        member: fb.control('')
      });
    }

  ngOnInit(): void {
    this.setAcceptReferred(this.acceptReferredAssign);
    this.setCommitteeMembers();
  }

  ngOnChanges(): void {
    this.isAdmin = this.viewingUser?.admin;
    this.disable = !this.viewingUser?.reviewer;
  } 

  setAcceptReferred(acceptReferred: boolean) {
    this.acceptReferredAssign = acceptReferred;

    if (this.acceptReferredAssign) {
      this.assignForm.get('member').removeValidators(Validators.required);
    } else {
      this.assignForm.get('member').addValidators(Validators.required);
    }
  }

  toggleDisplayed(explicit?: boolean) {
    if (explicit != undefined) {
      this.displayed = explicit;
    } else {
      this.displayed = !this.displayed;
    }
  }

  /**
   * Sort function for sorting a list of assignable users
   * @param a the first user to compare
   * @param b the user to compare with a
   */
  private static sortAssignableUsers(a: AssignableUser, b: AssignableUser): number {
    if (a.previouslyAssigned && b.previouslyAssigned) {
      return 0;
    } else if (a.previouslyAssigned || b.previouslyAssigned) {
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * Map each of the users in the response to an assignable user and return the array of mapped results. If the user is already assigned,
   * they will not be in the result
   * @param response the response to map
   */
  private mapCommitteeMembersToAssignableUser(response: UserResponseShortened[]): AssignableUser[] {
    const assignedUsernames: string[] = (this.application.assignedCommitteeMembers) ? 
      this.application.assignedCommitteeMembers.map(assigned => assigned.user.username) : [];
    return response.filter(user => assignedUsernames.indexOf(user.username) == -1)
      .map(response => {
        const username = response.username;
        const previouslyAssigned = this.application.previousCommitteeMembers && this.application.previousCommitteeMembers.filter(member => member.username == username).length > 0;

        return new AssignableUser(response, previouslyAssigned);
      })
      .sort(AssignedUsersComponent.sortAssignableUsers);
  }

  setCommitteeMembers() {
    const resolved = resolveStatus(this.application.status);

    if (resolved == ApplicationStatus.REVIEW || resolved == ApplicationStatus.RESUBMITTED) {
      this.authorizationService.userService.getAllUsers('REVIEW_APPLICATIONS')
        .pipe(
          retry(3),
          catchError((e) => {
            this.assignAlert.displayMessage(e, true)
            return of();
          }),
          map(response => this.mapCommitteeMembersToAssignableUser(response))
        )
        .subscribe({
          next: response => this.committeeMembers = response,
          error: e => {
            if (this.assignAlert) {
              this.assignAlert.displayMessage(e, true);
            } else {
              console.log(e);
            }
          }
        });
    }
  }
  
  unassignUser(assigned: AssignedCommitteeMember) {
    this.applicationService.unassignCommitteeMember(this.application, assigned.user.username)
      .subscribe({
        next: () => {
          this.assignAlert.displayMessage('User unassigned successfully');
          this.unassigned.emit(assigned);
          this.setCommitteeMembers();
        },
        error: e => this.assignAlert.displayMessage(e, true)
      });
  }

  navigateUser(user: User) {
    this.router.navigate(['profile'], {
      queryParams: {
        username: user.username
      }
    });
  }

  private assignUsers(users: string[]): void {
    this.applicationService.assignCommitteeMembers(this.application, users)
      .subscribe({
        next: response => {
          this.assignAlert.displayMessage('Committee Member Assigned successfully');
          this.application.assignedCommitteeMembers = response.members.map(a => new AssignedCommitteeMember(a.id, a.applicationId, 
            shortResponseToUserMapper(a.member), a.finishReview));
          this.setCommitteeMembers();
        },
        error: e => this.assignAlert.displayMessage(e, true)
      });
  }

  assignMember() {
    let value = this.assignForm.get('member').value;

    if (value || value == '') {
      if (value == '') {
        value = [];
      } else if (!Array.isArray(value)) {
        value = [value];
      }

      if (this.acceptReferredAssign) {
        this.assignedUsers.emit(value);
      } else {
        this.assignUsers(value);
      }
    }
  }

  checkStatus(status: string): boolean {
    return resolveStatus(this.application.status) == ApplicationStatus[status];
  }
}
