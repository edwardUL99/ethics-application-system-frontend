import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContext } from '../../../users/usercontext';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationService } from '../../application.service';
import { ApplicationContext, ViewingUser } from '../../applicationcontext';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';
import { Application } from '../../models/applications/application';
import { DraftApplicationInitialiser } from '../../models/applications/applicationinit';
import { ApplicationTemplateDisplayComponent } from '../application-template-display/application-template-display.component';
import { ActionBranchSource, AutosaveSource, QuestionChangeEvent } from '../component/application-view.component';
import { environment } from '../../../../environments/environment';
import { User } from '../../../users/user';
import { catchError, map, Observable, of, retry, take} from 'rxjs';
import { CanDeactivateComponent } from '../../../pending-changes/pendingchangesguard';
import { ApplicationStatus, StatusDescpriptions } from '../../models/applications/applicationstatus';
import { Answer } from '../../models/applications/answer';
import { AlertComponent } from '../../../alert/alert.component';
import { CreateDraftApplicationRequest, CreateDraftApplicationResponse, UpdateDraftApplicationRequest, UpdateDraftApplicationResponse } from '../../models/requests/draftapplicationrequests';
import { MessageMappings } from '../../../mappings';
import { AuthorizationService } from '../../../users/authorization.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserResponseShortened } from '../../../users/responses/userresponseshortened';
import { getErrorMessage, joinAndWait } from '../../../utils';
import { ReviewApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { ReferApplicationRequest } from '../../models/requests/referapplicationrequest';
import { SubmitApplicationRequest } from '../../models/requests/submitapplicationrequest';
import { mapAnswers, mapAssignedMembers, mapComment, resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { AttachmentsComponent } from '../attachments/attachments/attachments.component';

import { Location } from '@angular/common';
import { AssignedUsersComponent } from '../assigned-users/assigned-users.component';
import { AcceptResubmittedRequest } from '../../models/requests/acceptresubmittedrequest';
import { ApproveApplicationRequest } from '../../models/requests/approveapplicationrequest';
import { Comment } from '../../models/applications/comment';
import { PatchAnswersRequest } from '../../models/requests/patchanswerrequest';
import { AnswersMapping as ApplicationAnswers } from '../../models/applications/types';
import { AnswerRequestService } from '../../answer-request.service';
import { AddAnswerRequest } from '../../models/requests/answer-requests/requests';
import { AddAnswerRequestResponse } from '../../models/requests/answer-requests/responses';
import { RequestComponentAnswerComponent } from '../answer-requests/request-component-answer/request-component-answer.component';

/**
 * The default template ID to use
 */
export const DEFAULT_TEMPLATE = environment.default_template_id;

@Component({
  selector: 'app-application-display',
  templateUrl: './application-display.component.html',
  styleUrls: ['./application-display.component.css']
})
export class ApplicationDisplayComponent extends CanDeactivateComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  /**
   * The application being displayed
   */
  @Input() application: Application;
  /**
   * An error message being displayed while loading
   */
  loadError: string;
  /**
   * An error message that displayed when save failed
   */
  saveError: string;
  /**
   * An error related to performing an action like approving/rejecting an application or assigning committee members
   */
  actionError: string;
  /**
   * The template view
   */
  @ViewChild('templateView')
  templateView: ApplicationTemplateDisplayComponent;
  /**
   * The alert to display a message saying the application has been saved
   */
  @ViewChild('saveAlert')
  saveAlert: AlertComponent;
  /**
   * The alert to notify the user that the action succeeded
   */
  @ViewChild('actionAlert')
  actionAlert: AlertComponent;
  /**
   * An alert to show a save error
   */
  @ViewChild('saveErrorAlert')
  saveErrorAlert: AlertComponent;
  /**
   * The user either creating the application or viewing the application
   */
  user: User;
  /**
   * Determines if the user can review the application
   */
  canReview: boolean;
  /**
   * Determines if the user viewing the application has admin privileges
   */
  isAdmin: boolean;
  /**
   * Indicates if this application is a new application
   */
  newApplication: boolean = false;
  /**
   * A variable indicating if the application is saved
   */
  private saved: boolean = true;
  /**
   * This variable if set freezes changes to the saved property
   */
  private freezeSaved: boolean = false;
  /**
   * The observable retrieving users that can review applications
   */
  committeeMembers: Observable<UserResponseShortened[]>;
  /**
   * The form to create the final comment
   */
  finalCommentForm: FormGroup;
  /**
   * Determines if the final comment form is displayed or not
   */
  finalCommentFormDisplayed: boolean = false;
  /**
   * A value to indicate that the final comment form is being displayed to approve/reject
   */
  finalCommentFormApproval: boolean;
  /**
   * The user viewing the application
   */
  viewingUser: ViewingUser;
  /**
   * The attachments modal for adding attachments
   */
  @ViewChild('applicationAttachments')
  applicationAttachments: AttachmentsComponent;
  /**
   * The assigned users component
   */
  @ViewChild('assignedUsers')
  assignedUsers: AssignedUsersComponent;
  /**
   * Flags if the view has been initialised
   */
  private viewInitialised: boolean = false;
  /**
   * A callback to retry an action
   */
  actionRetryCallback: () => void;
  /**
   * The descriptions of the application statuses
   */
  readonly statusDescriptions = StatusDescpriptions;

  constructor(private applicationService: ApplicationService, 
    private templateService: ApplicationTemplateService,
    private applicationContext: ApplicationContext,
    private activatedRoute: ActivatedRoute,
    private userContext: UserContext,
    private authorizationService: AuthorizationService,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private location: Location,
    private requestService: AnswerRequestService) {
    super();

    this.finalCommentForm = this.fb.group({
      comment: fb.control('')
    });
  }

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.viewInitialised = true;
  }

  ngOnChanges(): void {
    if (this.viewInitialised && this.templateView) {
      this.templateView.viewingUser = this.viewingUser;
    }
  }

  navigateToUser(username: string) {
    if (username) {
      this.router.navigate(['profile'], {
        queryParams: {
          username: username
        }
      });
    }
  }

  private load() {
    this.userContext.getUser().subscribe({
      next: user => {
        if (!user) {
          this.router.navigate(['logout']);
        } else {
          this.user = user;
          this.loadApplication();
        }
      },
      error: e => this.loadError = e
    });

    this.setCommitteeMembers();
  }

  private setCommitteeMembers() {
    // returns a list of users that aren't already assigned
    const committeeMembersAssignedMapper = (response: UserResponseShortened[]): UserResponseShortened[] => {
      const assignedUsernames: string[] = this.application.assignedCommitteeMembers.map(assigned => assigned.user.username);
      return response.filter(user => assignedUsernames.indexOf(user.username) == -1);
    }

    this.committeeMembers = this.authorizationService.userService.getAllUsers('REVIEW_APPLICATIONS')
      .pipe(
        retry(3),
        catchError((e) => {
          this.actionError = getErrorMessage(e);
          return of();
        }),
        map(committeeMembersAssignedMapper)
      );
  }

  private setApplication(application: Application, setTemplateContext: boolean = true) {
    if (setTemplateContext) {
      const context = ApplicationTemplateContext.getInstance();
      context.addTemplate(application.applicationTemplate);
      context.setCurrentTemplate(application.applicationTemplate.id);
    }

    this.application = application;
    this.applicationContext.setApplication(this.application);

    this.freezeSaved = !(this.checkStatus('DRAFT') || this.checkStatus('REFERRED'));
    this.saved = this.freezeSaved;
  }

  private generateApplication(context: ApplicationTemplateContext) {
    this.userContext.getUser().subscribe({
      next: user => {
        this.setApplication(Application.create(new DraftApplicationInitialiser(0, 'N/A', user, context.getCurrentTemplate(), {}, [], undefined)), false);
        this.getViewingUser(this.newApplication);
      },
      error: e => this.loadError = e
    });
  }

  private createNewApplication(templateId: string) {
    this.newApplication = true;
    const context = ApplicationTemplateContext.getInstance();
    const template = (templateId) ? templateId : DEFAULT_TEMPLATE;

    if (Object.keys(context.applications).length == 0 || !(template in context.applications)) {
      this.templateService.mapTemplateResponse().subscribe({
        next: response => {
          if (!(template in response.applications)) {
            this.loadError = 'The application with ID ' + template + ' does not exist. Contact the ethics committee for to notify them of the error';
          }
  
          context.addFromResponse(response);
          context.setCurrentTemplate(template);
  
          this.generateApplication(context);
        },
        error: e => this.loadError = e
      });
    } else {
      context.setCurrentTemplate(template);
      this.generateApplication(context); // the template already exists, so we only need to generate the ID
    }
  }

  private toggleFinalDisplayed(finalCommentApproval: boolean, explicit?: boolean) {
    if (explicit != undefined) {
      this.finalCommentFormDisplayed = explicit;
    } else {
      this.finalCommentFormDisplayed = !this.finalCommentFormDisplayed;
    }

    if (!explicit && finalCommentApproval != undefined && this.finalCommentFormApproval != undefined && this.finalCommentFormApproval != finalCommentApproval) {
      this.finalCommentFormDisplayed = true;
    }
  }

  toggleFinalCommentForm(finalCommentApproval: boolean, explicit?: boolean) {
    this.toggleFinalDisplayed(finalCommentApproval, explicit);

    const comment = this.finalCommentForm.get('comment');
    comment.clearValidators();

    this.finalCommentFormApproval = finalCommentApproval;

    if (finalCommentApproval) {
      comment.clearValidators();
    } else {
      comment.addValidators(Validators.required);
    }

    comment.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    RequestComponentAnswerComponent.reset();
    ApplicationTemplateContext.getInstance().clear();
  }

  formatDate(date: Date) {
    if (!date) {
      return 'N/A';
    } else {
      return date.toLocaleString();
    }
  }

  private getViewingUser(newApplication: boolean) {
    this.applicationContext.getViewingUser(newApplication).subscribe({
      next: user => {
        this.viewingUser = user;
        this.permissionsCheck();
        this.cd.detectChanges();
      },
      error: e => this.loadError = e
    });
  }

  loadApplication(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (!params.id && params.new == undefined) {
        this.loadError = 'You need to specify an id parameter in the URL'
      } else {
        if (params.new !== undefined) {
          this.createNewApplication(params.new);
        } else {
          this.applicationService.getApplication({id: params.id})
            .pipe(take(1))
            .subscribe({
              next: response => {
                this.applicationService.mapApplicationResponse(response).subscribe({
                  next: v => {
                    this.setApplication(v);
                    this.getViewingUser(false);
                    this.cd.detectChanges();
                  },
                  error: e => this.loadError = e
                });
              },
              error: e => this.loadError = e
          });
        }
      }
    });
  }

  private reload(hotReload: boolean = false) {
    this.newApplication = false;

    if (!hotReload) {
      this.router.navigate([], {
        queryParams: {
          id: this.application.applicationId
        },
        replaceUrl: true,
        relativeTo: this.activatedRoute
      });
    } else {
      this.router.navigate(['application'], {
        queryParams: {
          id: this.application.applicationId
        }
      });
      this.templateView.reload();
      this.templateView.getRequestedAnswers().clear();
    }
  }

  private setAnswer(answer: Answer, e: QuestionChangeEvent) {
    if (answer) {
      // set the answer on the application from a question change event
      const componentId = answer.componentId;

      if (!e.autosave) {
        // initial set answer, only override if anwer not in application answers or answer value is different
        const existing = this.application.answers[componentId];

        if (existing && existing.value == answer.value) {
          return;
        }
      }

      if (!answer.empty()) {
        this.application.answers[componentId] = answer;
      } else {
        delete this.application.answers[componentId];
      }
    }
  }

  questionChange(event: QuestionChangeEvent) {
    // a question has a change to it in a sub component
    if (!this.freezeSaved)
      this.saved = false;

    const answer: Answer | Answer[] = event.view.value();

    if (answer) {
      if (Array.isArray(answer)) {
        answer.forEach(a => this.setAnswer(a, event));
      } else {
        this.setAnswer(answer, event);
      }
    }
  }

  autoSave(source: AutosaveSource) {
    const saveMessage = 'Section saved automatically';

    const updateCallback = (response?: UpdateDraftApplicationResponse, error?: any) => {
      if (response) {
        this.application.lastUpdated = new Date(response.lastUpdated);
        this.application.answers = mapAnswers(response.answers);
        source.onAutoSave(saveMessage);
        this.saved = true;
      } else {
        source.onAutoSave(error, true);
      }

      this.templateView.markAutosaved(source); // mark autosave as finished so future autosaves will work
    }

    // a section requested that it do be autosaved
    if (this.application.status == ApplicationStatus.DRAFT) {
      const createCallback = (response?: CreateDraftApplicationResponse, error?: any) => {
        if (response) {
          this.application.applicationId = response.id;
          this.application.answers = mapAnswers(response.answers);
          this._populateApplication(response);
          source.onAutoSave(saveMessage);
          this.reload();
          this.saved = true;
        } else {
          source.onAutoSave(error, true);
        }

        this.templateView.markAutosaved(source); // mark autosave as finished so future autosaves will work
      }

      this.saveDraft(createCallback, updateCallback);
      
      return true;
    } else if (this.application.status == ApplicationStatus.REFERRED) {
      this.saveReferred(updateCallback);

      return true;
    }

    return false;
  }

  private displaySaveAlert() {
    this.saveAlert.displayMessage(MessageMappings.application_updated);
  }

  private _populateApplication(response?: CreateDraftApplicationResponse) {
    // populate application parameters from created application
    this.application.lastUpdated = new Date(response.createdAt);
    this.application.id = response.dbId;
    this.application.applicationTemplate.databaseId = response.templateId;
  }

  private createDraftCallback(response?: CreateDraftApplicationResponse, error?: any, reload?: boolean): void {
    if (response) {
      this.application.applicationId = response.id;
      this.application.answers = mapAnswers(response.answers);
      this._populateApplication(response);
      this.displaySaveAlert();

      if (reload) {
        this.reload(false);
      }

      this.saved = true;
    } else {
      this.saveError = error;
      this.saveErrorAlert.show();
    }
  }

  private createDraft(createCallback: (response?: CreateDraftApplicationResponse, error?: any) => void) {
    this.applicationService.createDraftApplication(
      new CreateDraftApplicationRequest(this.user.username, this.application.applicationTemplate, this.application.answers))
        .subscribe({
          next: response => createCallback(response),
          error: e => createCallback(undefined, e)
        });
  }

  private updateDraftCallback(response?: UpdateDraftApplicationResponse, error?: any): void {
    if (response) {
      if (response.error) {
        this.saveError = response.error;
      } else if (response.message == 'application_updated') {
        this.application.lastUpdated = new Date(response.lastUpdated);
        this.application.answers = mapAnswers(response.answers);
        this.saved = true;
        this.displaySaveAlert();
      } else {
        this.saveError = 'An unknown response from the server was received, try again';
        this.saveErrorAlert.show();
      }
    } else if (error) {
      this.saveError = error;
      this.saveErrorAlert.show();
    }
  }

  private updateDraft(callback: (response?: UpdateDraftApplicationResponse, error?: any) => void) {
    this.applicationService.updateDraftApplication(
      new UpdateDraftApplicationRequest(this.application.applicationId, this.application.answers, this.application.attachedFiles, this.application.applicationTemplate))
      .subscribe({
        next: response => {
          callback(response);
        },
        error: e => callback(undefined, e)
      });
  }

  private saveDraft(createCallback: (response?: CreateDraftApplicationResponse, error?: any) => void,
    updateCallback: (response?: UpdateDraftApplicationResponse, error?: any) => void) {
    
    if (this.newApplication) {
      this.createDraft(createCallback);
    } else {
      this.updateDraft(updateCallback);
    }
  }

  private saveReferred(callback: (response?: UpdateDraftApplicationResponse, error?: any) => void) {
    const request = new UpdateDraftApplicationRequest(this.application.applicationId, this.application.answers, this.application.attachedFiles, this.application.applicationTemplate);
    this.applicationService.updateReferredApplication(request)
      .subscribe({
        next: response => callback(response),
        error: e => callback(undefined, e)
      });
  }

  save() {
    this.saveCallback((r?: CreateDraftApplicationResponse, e?: any) => this.createDraftCallback(r, e, true),
      (r?: UpdateDraftApplicationResponse, e?: any) => this.updateDraftCallback(r, e))
  }

  saveAndUpdateDisplay(callback: (e?: any) => void) {
    // save/update the applicate and then update the display which then calls the provided callback
    const createCallback = (r?: CreateDraftApplicationResponse, e?: any) => {
      this.createDraftCallback(r, e, false);
      const url = this.router.createUrlTree([], {relativeTo: this.activatedRoute, queryParams: {id: this.application.applicationId}}).toString()
      this.location.go(url);
      this.newApplication = false;
      callback(e);
    };

    const updateCallback = (r?: UpdateDraftApplicationResponse, e?: any) => {
      this.updateDraftCallback(r, e);
      callback(e);
    }

    this.saveCallback(createCallback, updateCallback);
  }

  private saveCallback(createCallback: (r?: CreateDraftApplicationResponse, e?: any) => void, updateCallback: (r?: UpdateDraftApplicationResponse, e?: any) => void) {
    if (this.application.status == ApplicationStatus.DRAFT) {
      this.saveDraft(createCallback, updateCallback);
    } else if (this.application.status == ApplicationStatus.REFERRED) {
      this.saveReferred(updateCallback);
    }
  }

  getStatus() {
    if (this.application.status) {
      return resolveStatus(this.application?.status);
    }
  }

  private saveBeforeSubmit() {
    const callback = (e?: any) => {
      if (!e) {
        this.saved = true;
        this.submit(false, false);
      } else {
        this.saveErrorAlert.displayMessage(e, true)
      }
    }

    this.saveCallback((r?: CreateDraftApplicationResponse, e?: any) => callback(e), 
      (r?: UpdateDraftApplicationResponse, e?: any) => callback(e));
  }

  submit(confirmSubmission: boolean = true, checkSaved: boolean = true) {
    if (!confirmSubmission || confirm('Are you sure you want to submit? Once submitted, you cannot change the application')) {
      if (checkSaved && (environment.forceSaveBeforeSubmit || !this.saved)) {
        this.saveBeforeSubmit(); // save any unsaved answers before submitting
      } else {
        this.applicationService.submitApplication(new SubmitApplicationRequest(this.application.applicationId))
          .subscribe({
            next: response => {
              this.application.status = response.status;
              this.application.lastUpdated = new Date(response.lastUpdated);
              this.application.submittedTime = new Date(response.submittedTime);
              this.application.id = response.dbId;
              this.application.answers = mapAnswers(response.answers);
              this.reload(true);
              this.scrollUp();
            },
            error: e => this.saveErrorAlert.displayMessage(e, true)
          });
      }
    }
  }

  canDeactivate(): boolean | Observable<boolean> {
    return this.saved;
  }

  showSaveSubmitButton() {
    return this.application.status == ApplicationStatus.DRAFT || this.application.status == ApplicationStatus.REFERRED;
  }

  isReferred() {
    return this.application.status == ApplicationStatus.REFERRED;
  }

  checkStatus(status: string): boolean {
    return resolveStatus(this.application.status) == ApplicationStatus[status];
  }

  /**
   * Display the action success alert
   * @param message the message to display
   * @param error if the message is an error
   */
  private displayActionAlert(message: string, error: boolean = false) {
    this.actionAlert.displayMessage(message, error);
  }

  memberUnassigned() {
    this.reload(true);
  }

  private isAssigned(username: string): boolean {
    return this.application.assignedCommitteeMembers
      .filter(assigned => assigned.user.username == username)
      .length > 0;
  }

  private markReviewedAdmin(checkAssigned?: boolean) {
    // an admin can mark the whole application as reviewed
    if (checkAssigned && this.isAssigned(this.viewingUser.user.username)) {
      if (confirm('You are assigned to the application. Click Ok if you want to mark your review as finished or Cancel if you want to finish the review process')) {
        this.markReviewedAssigned();
      } else {
        this.markReviewedAdmin(false);
      }
    } else {
      const resolvedStatus = resolveStatus(this.application.status);

    let finishReview: boolean;
    let startReview: boolean = resolvedStatus == ApplicationStatus.SUBMITTED;

    if (resolvedStatus == ApplicationStatus.REVIEW) {
      finishReview = true;
    } else if (resolvedStatus == ApplicationStatus.REVIEWED || resolvedStatus == ApplicationStatus.SUBMITTED) {
      finishReview = false;
    } else {
      return; // not correct status for marking as review
    }

    this.applicationService.markReview(new ReviewApplicationRequest(this.application.applicationId, finishReview))
      .subscribe({
        next: response => {
          this.application.status = response.status;
          this.application.lastUpdated = new Date(response.lastUpdated);
          
          response.assignedCommitteeMembers.forEach(a => {
            for (let assigned of this.application.assignedCommitteeMembers) {
              if (a.username == assigned.user.username) {
                assigned.finishReview = a.finishReview;
                break;
              }
            }  
          });
          
          let message: string;

          if (startReview) {
            message = 'Application moved to review';
          } else {
            message = (finishReview) ? 'Application marked as reviewed':'Application moved back to review';
          }

          if (!finishReview) {
            this.assignedUsers.setCommitteeMembers();
          }

          this.displayActionAlert(message);
          this.reload(true);
        },
        error: e => this.actionError = e
      });
    }
  }

  displayReviewButton() {
    if (this.viewingUser?.admin) {
      return true;
    } else if (this.viewingUser?.reviewer) {
      const found = this.application.assignedCommitteeMembers.find(u => u.user.username == this.viewingUser.user.username);
      return found && !found.finishReview;
    } else {
      return false;
    }
  }

  private markReviewedAssigned() {
    // mark your own review as finished rather than whole application (for assigned members)
    if (confirm('Please confirm that you are finished your review')) {
      this.applicationService.finishMemberReview(this.application, this.viewingUser.user.username)
        .subscribe({
          next: () => {
            this.displayActionAlert('You have successfuly finished your review');
            this.reload(true);
          },
          error: e => this.actionError = e
        });
    }
  }

  markReviewed() {
    const resolvedStatus = resolveStatus(this.application.status);
    this.hideActionRetry();

    if (this.isAdmin) {
      this.markReviewedAdmin();
    } else {
      if (resolvedStatus == ApplicationStatus.REVIEW) {
        this.markReviewedAssigned();
      }
    }
  }

  referApplication() {
    if (confirm('Are you sure you want to refer the application back to the applicant?')) {
      this.hideActionRetry();
      const fields = (this.application.editableFields) ? this.application.editableFields : [];
      this.applicationService.referApplication(new ReferApplicationRequest(this.application.applicationId, fields, this.user.username))
        .subscribe({
          next: response => {
            this.application.status = response.status;
            this.application.referredBy = this.user;
            this.application.editableFields = response.editableFields;
            this.application.lastUpdated = new Date(response.lastUpdated);
            this.displayActionAlert('Application referred to applicant');
            this.reload(true);
          },
          error: e => this.actionError = e
        });
    }
  }

  acceptReferred() {
    this.actionRetryCallback = undefined;
    this.assignedUsers.setAcceptReferred(!this.assignedUsers.displayed);
    this.assignedUsers.toggleDisplayed(!this.assignedUsers.displayed);
  }

  acceptAssignedUsers(users: string[]) {
    this.applicationService.acceptResubmitted(new AcceptResubmittedRequest(this.application.applicationId, users))
      .subscribe({
        next: response => {
          this.displayActionAlert('Referred application accepted by the committee successfully');
          this.assignedUsers.acceptReferredAssign = false;
          this.assignedUsers.toggleDisplayed(false);
          this.application.status = response.status;
          mapAssignedMembers(response.assignedCommitteeMembers)
            .subscribe({
              next: response => this.application.assignedCommitteeMembers = response,
              error: e => console.error(e)
            });
          this.application.previousCommitteeMembers = [];
          this.reload(true);
        },
        error: e => {
          this.displayActionAlert(e, true);
          this.assignedUsers.acceptReferredAssign = false;
        }
      });
  }

  private doApproval(approve: boolean, finalComment: Comment) {
    const request = new ApproveApplicationRequest(this.application.applicationId, approve, finalComment);

    this.applicationService.approveApplication(request)
      .subscribe({
        next: response => {
          this.displayActionAlert((approve) ? 'Application approved successfully' : 'Application rejected successfully');
          
          this.application.status = response.status;
          this.application.lastUpdated = new Date(response.lastUpdated);
          this.application.approvalTime = new Date(response.lastUpdated);
          this.application.finalComment = mapComment(response.finalComment);
          
          this.reload(true);
        },
        error: e => this.displayActionAlert(e, true)
      });
  }

  private getFinalComment(): Comment {
    const value = this.finalCommentForm.get('comment').value;

    return (value == '') ? undefined : new Comment(undefined, this.viewingUser.user.username, value, undefined, [], new Date(), true);
  }

  private scrollUp() {
    document.querySelector('#top')?.scrollIntoView();
  }

  rejectApplication() {
    if (confirm('Are you sure you want to reject the application?')) {
      this.hideActionRetry();
      this.doApproval(false, this.getFinalComment());
    }
  }

  approveApplication() {
    if (confirm('Are you sure you want to approve the application?')) {
      this.hideActionRetry();
      this.doApproval(true, this.getFinalComment());
    }
  }

  private permissionsCheck() {
    // check user's permissions and set appropriate permissions variables from it
    if (this.newApplication && !this.viewingUser.create) {
      this.loadError = 'You do not have the permissions to create a new application';
    } else {
      this.canReview = !this.viewingUser.applicant && this.viewingUser.reviewer;
      this.isAdmin = this.viewingUser.admin;
    }
  }

  attachFile(source: ActionBranchSource) {
    if (source && (this.application.status == ApplicationStatus.DRAFT || this.application.status == ApplicationStatus.REFERRED)) {
      this.applicationAttachments.attachments.attachFileCallback({
        next: () => source.onFileAttached('File attached successfully'),
        error: e => source.onFileAttached(e, true)
      });
    }
  }

  terminateApplication(source: ActionBranchSource) {
    if (source && this.application.status == ApplicationStatus.DRAFT) {
      const redirect = () => {
        this.freezeSaved = true; // don't allow any event propagation to change the saved property
        this.saved = true;
        this.router.navigate(['applications']);
      };

      if (this.newApplication || !environment.deleteApplicationOnTerminate) {
        redirect();
      } else {
        this.applicationService.deleteApplication(this.application.applicationId)
          .subscribe({
            next: () => redirect(),
            error: e => source.displayError(e)
          });
      }
    }
  }

  deleteApplication(admin: boolean) {
    if (confirm('Are you sure you want to delete the application. All changes will be lost and cannot be reversed')) {
      this.hideActionRetry();
      this.saved = true;
      this.applicationService.deleteApplication(this.application.applicationId, admin)
        .subscribe({
          next: () => this.router.navigate(['applications']),
          error: e => this.displayActionAlert(e, true)
        });
    }
  }

  private hideActionRetry() {
    this.actionRetryCallback = undefined;
    this.actionAlert.hide();
  }

  autofillNotified(answers: ApplicationAnswers) {
    // notify of an autofill event
    if (answers && Object.keys(answers).length > 0 && this.application.status != ApplicationStatus.DRAFT) {
      this.applicationService.patchAnswers(new PatchAnswersRequest(this.application.applicationId, answers))
        .subscribe({
          next: response => {
            this.application.answers = mapAnswers(response.answers);
            this.application.lastUpdated = new Date(response.lastUpdated);
            this.reload(true);
            this.saved = true;
            this.hideActionRetry();
          },
          error: e => {
            this.displayActionAlert('Failed to update application due to error: ' + e, true);
            this.actionRetryCallback = () => this.autofillNotified(answers);
          }
        });
    }
  }

  submitRequests() {
    if (!this.newApplication) {
      const requestedAnswers = this.templateView.getRequestedAnswers();
      const answers = requestedAnswers.getAnswers();
      const requests: Observable<AddAnswerRequestResponse>[] = [];

      Object.keys(answers).forEach(requested => {
        const username = requested;
        const componentsMap = answers[username];
        const components = Object.keys(componentsMap).map(key => componentsMap[key]);

        requests.push(this.requestService.createRequest(
          new AddAnswerRequest(this.application.applicationId, username, components)));
      });

      joinAndWait(requests)
        .subscribe({
          next: response => {
            const usernames = response.map(r => r.user);
            const users = (usernames.length > 1) ? 'users':'user';
            this.saveAlert.displayMessage(`Answers requested from ${users} ${usernames.join(', ')} successfully`);
            requestedAnswers.clear();
            this.templateView?.answerRequestSubmitted.emit(true);
            this.cd.detectChanges();
          },
          error: e => this.saveAlert.displayMessage(e, true)
        });
    }
  }
}
