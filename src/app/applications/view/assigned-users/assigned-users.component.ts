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
  committeeMembers: UserResponseShortened[];

  constructor(private router: Router, private applicationService: ApplicationService,
    private fb: FormBuilder,
    private authorizationService: AuthorizationService) {
      this.assignForm = this.fb.group({
        member: fb.control('', [Validators.required])
      });
    }

  ngOnInit(): void {
    this.setCommitteeMembers();
  }

  ngOnChanges(): void {
    this.isAdmin = this.viewingUser?.admin;
  }

  toggleDisplayed(explicit?: boolean) {
    if (explicit != undefined) {
      this.displayed = explicit;
    } else {
      this.displayed = !this.displayed;
    }
  }

  private setCommitteeMembers() {
    // returns a list of users that aren't already assigned
    const committeeMembersAssignedMapper = (response: UserResponseShortened[]): UserResponseShortened[] => {
      const assignedUsernames: string[] = this.application.assignedCommitteeMembers.map(assigned => assigned.user.username);
      return response.filter(user => assignedUsernames.indexOf(user.username) == -1);
    }

    this.authorizationService.userService.getAllUsers('REVIEW_APPLICATIONS')
      .pipe(
        retry(3),
        catchError((e) => {
          this.assignAlert.displayMessage(e, true)
          return of();
        }),
        map(committeeMembersAssignedMapper)
      )
      .subscribe({
        next: response => this.committeeMembers = response,
        error: e => this.assignAlert.displayMessage(e, true)
      });
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

  assignMember() {
    let value = this.assignForm.get('member').value;

    if (value) {
      if (!Array.isArray(value)) {
        value = [value];
      }

      this.applicationService.assignCommitteeMembers(this.application, value)
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
  }

  checkStatus(status: string): boolean {
    return resolveStatus(this.application.status) == ApplicationStatus[status];
  }
}
