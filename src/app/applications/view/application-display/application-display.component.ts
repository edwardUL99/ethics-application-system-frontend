import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContext } from '../../../users/usercontext';
import { ApplicationTemplateService } from '../../application-template.service';
import { ApplicationService } from '../../application.service';
import { ApplicationContext, ViewingUser } from '../../applicationcontext';
import { ApplicationTemplateContext } from '../../applicationtemplatecontext';
import { Application } from '../../models/applications/application';
import { DraftApplicationInitialiser } from '../../models/applications/applicationinit';
import { ApplicationTemplateDisplayComponent } from '../application-template-display/application-template-display.component';
import { QuestionChangeEvent } from '../component/application-view.component';
import { SectionViewComponent } from '../component/section-view/section-view.component';
import { environment } from '../../../../environments/environment';
import { User } from '../../../users/user';
import { catchError, Observable, of, retry, take} from 'rxjs';
import { CanDeactivateComponent } from '../../../pending-changes/pendingchangesguard';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { Answer } from '../../models/applications/answer';
import { AlertComponent } from '../../../alert/alert.component';
import { CreateDraftApplicationRequest, CreateDraftApplicationResponse, UpdateDraftApplicationRequest, UpdateDraftApplicationResponse } from '../../models/requests/draftapplicationrequests';
import { MessageMappings } from '../../../mappings';
import { AuthorizationService } from '../../../users/authorization.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserResponseShortened } from '../../../users/responses/userresponseshortened';
import { getErrorMessage } from '../../../utils';
import { ReviewApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { ReferApplicationRequest } from '../../models/requests/referapplicationrequest';
import { SubmitApplicationRequest } from '../../models/requests/submitapplicationrequest';
import { mapAnswers } from '../../models/requests/mapping/applicationmapper'

/**
 * The interval to display alerts for
 */
const ALERT_INTERVAL = 2000;

/**
 * The default template ID to use
 */
export const DEFAULT_TEMPLATE = environment.default_template_id;

@Component({
  selector: 'app-application-display',
  templateUrl: './application-display.component.html',
  styleUrls: ['./application-display.component.css']
})
export class ApplicationDisplayComponent extends CanDeactivateComponent implements OnInit, OnDestroy {
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
  @ViewChild(ApplicationTemplateDisplayComponent)
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
   * The form group to assign the form to a committee member
   */
  assignForm: FormGroup;
  /**
   * Indicates if this application is a new application
   */
  private newApplication: boolean = false;
  /**
   * A variable indicating if the application is saved
   */
  private saved: boolean = true;
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

  constructor(private applicationService: ApplicationService, 
    private templateService: ApplicationTemplateService,
    private applicationContext: ApplicationContext,
    private activatedRoute: ActivatedRoute,
    private userContext: UserContext,
    private authorizationService: AuthorizationService,
    private router: Router,
    private fb: FormBuilder,
    private element: ElementRef,
    private cd: ChangeDetectorRef) {
    super();

    this.assignForm = this.fb.group({
      member: fb.control('', [Validators.required])
    });

    this.finalCommentForm = this.fb.group({
      comment: fb.control('', [Validators.required]),
      approval: fb.control('')
    });

    this.element.nativeElement.addEventListener('click', () => {
      // allow autosave once the user interacts with the window
      this.applicationContext.disableAutosave = false;
    });
  }

  ngOnInit(): void {
    this.applicationContext.disableAutosave = true;
    this.load();
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

    this.committeeMembers = this.authorizationService.userService.getAllUsers('REVIEW_APPLICATIONS')
      .pipe(
        retry(3),
        catchError((e) => {
          this.actionError = getErrorMessage(e);
          return of();
        })
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
    this.cd.detectChanges();
  }

  private generateApplication(context: ApplicationTemplateContext) {
    this.userContext.getUser().subscribe({
      next: user => {
        this.setApplication(Application.create(new DraftApplicationInitialiser(0, 'N/A', user, context.getCurrentTemplate(), {}, {}, undefined)), false);
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

  toggleFinalCommentForm(finalCommentApproval: boolean, explicit?: boolean) {
    if (explicit != undefined) {
      this.finalCommentFormDisplayed = explicit;
    } else {
      this.finalCommentFormDisplayed = !this.finalCommentFormDisplayed;
    }

    this.finalCommentFormApproval = finalCommentApproval;
  }

  ngOnDestroy(): void {
    ApplicationTemplateContext.getInstance().clear(); // TODO decide if this is necessary, but it maybe as container replacement may modify the template for the next createApplication
  }

  getLastUpdatedDate() {
    let lastUpdated = this.application?.lastUpdated;

    if (!lastUpdated) {
      return 'N/A';
    } else {
      return lastUpdated.toLocaleString();
    }
  }

  private getViewingUser(newApplication: boolean) {
    this.applicationContext.getViewingUser(newApplication).subscribe({
      next: user => {
        this.viewingUser = user;
        this.permissionsCheck();
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
          this.getViewingUser(true);
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
                  },
                  error: e => this.loadError = e
                });
              },
              error: e => this.loadError = e
          });
        }
      }
    });

    // // TODO this component is being tested and needs improvement but for now it should be ok
    // this.setApplication(createDraftApplication());
  }

  private reload(hotReload: boolean = false) {
    if (!hotReload) {
      this.router.navigate([], {
        queryParams: {
          id: this.application.applicationId
        },
        replaceUrl: true,
        relativeTo: this.activatedRoute
      });

      this.newApplication = false;
    } else {
      window.location.reload();
    }
  }

  private setAnswer(answer: Answer) {
    if (answer) {
      // set the answer on the application from a question change event
      const componentId = answer.componentId;
      this.application.answers[componentId] = answer;
    }
  }

  questionChange(event: QuestionChangeEvent) {
    // a question has a change to it in a sub component
    this.saved = false;

    const answer: Answer | Answer[] = event.view.value();

    if (answer) {
      if (Array.isArray(answer)) {
        answer.forEach(a => this.setAnswer(a));
      } else {
        this.setAnswer(answer);
      }
    }
  }

  autoSave(section: SectionViewComponent) {
    if (!this.applicationContext.disableAutosave) {
      const saveMessage = 'Section saved automatically';

      const updateCallback = (response?: UpdateDraftApplicationResponse, error?: any) => {
        if (response) {
          this.application.lastUpdated = new Date(response.lastUpdated);
          this.application.answers = mapAnswers(response.answers);
          section.onAutoSave(saveMessage);
          this.saved = true;
        } else {
          section.onAutoSave(error, true);
        }
      }

      // a section requested that it do be autosaved
      if (this.application.status == ApplicationStatus.DRAFT) {
        const createCallback = (response?: CreateDraftApplicationResponse, error?: any) => {
          if (response) {
            this.application.applicationId = response.id;
            this.application.answers = mapAnswers(response.answers);
            this._populateApplication(response);
            section.onAutoSave(saveMessage);
            this.saved = true;
            this.reload();
          } else {
            section.onAutoSave(error, true);
          }
        }

        this.saveDraft(createCallback, updateCallback);
      } else if (this.application.status == ApplicationStatus.REFERRED) {
        this.saveReferred(updateCallback);
      }
    }
  }

  private displaySaveAlert() {
    this.saveAlert.show();
    this.saveAlert.message = MessageMappings.application_updated;
    setTimeout(() => this.saveAlert.hide(), ALERT_INTERVAL);
  }

  private _populateApplication(response?: CreateDraftApplicationResponse) {
    // populate application parameters from created application
    this.application.lastUpdated = new Date(response.createdAt);
    this.application.id = response.dbId;
    this.application.applicationTemplate.databaseId = response.templateId;
  }

  private createDraftCallback(response?: CreateDraftApplicationResponse, error?: any): void {
    if (response) {
      this.application.applicationId = response.id;
      this.application.answers = mapAnswers(response.answers);
      this._populateApplication(response);
      this.saved = true;
      this.displaySaveAlert();
      this.reload(true);
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
    this.applicationService.updateDraftApplication(new UpdateDraftApplicationRequest(this.application.applicationId, this.application.answers, this.application.attachedFiles))
      .subscribe({
        next: response => {
          callback(response);
        },
        error: e => callback(undefined, e)
      });
  }

  private saveDraft(createCallback: (response?: CreateDraftApplicationResponse, error?: any) => void,
    updateCallback: (respponse?: UpdateDraftApplicationResponse, error?: any) => void) {
    
    if (this.newApplication) {
      this.createDraft(createCallback);
    } else {
      this.updateDraft(updateCallback);
    }
  }

  private saveReferred(callback: (response?: UpdateDraftApplicationResponse, error?: any) => void) {
    const request = new UpdateDraftApplicationRequest(this.application.applicationId, this.application.answers, this.application.attachedFiles);
    this.applicationService.updateReferredApplication(request)
      .subscribe({
        next: response => callback(response),
        error: e => callback(undefined, e)
      });
  }

  save() {
    if (this.application.status == ApplicationStatus.DRAFT) {
      this.saveDraft((r?: CreateDraftApplicationResponse, e?: any) => this.createDraftCallback(r, e),
        (r?: UpdateDraftApplicationResponse, e?: any) => this.updateDraftCallback(r, e));
    } else if (this.application.status == ApplicationStatus.REFERRED) {
      this.saveReferred((r?: UpdateDraftApplicationResponse, e?: any) => this.updateDraftCallback(r, e));
    }
  }

  submit(confirmSubmission: boolean = true) {
    if (!confirmSubmission || confirm('Are you sure you want to submit? Once submitted, you cannot change the application')) {
      if (!this.saved) {
        this.save(); // save any unsaved answers before submitting
        this.submit(false);
      } else {
        this.applicationService.submitApplication(new SubmitApplicationRequest(this.application.applicationId))
          .subscribe({
            next: response => {
              this.application.status = response.status;
              this.application.lastUpdated = new Date(response.lastUpdated);
              this.application.id = response.dbId;
              this.application.answers = mapAnswers(response.answers);
              this.reload(true);
            },
            error: e => {
              this.saveErrorAlert.message = e;
              this.saveErrorAlert.show();
            }
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
    return this.application.status == ApplicationStatus[status];
  }

  /**
   * Display the action success alert
   * @param message the message to display
   */
  private displayActionAlert(message: string) {
    this.actionAlert.message = message;
    this.actionAlert.show();
    setTimeout(() => {
      this.actionAlert.hide();
      this.actionAlert.message = '';
    }, ALERT_INTERVAL);
  }

  assignMembers() {
    const value = this.assignForm.get('member').value;

    if (value) {
      this.applicationService.assignCommitteeMembers(this.application, value)
        .subscribe({
          next: () => this.displayActionAlert('Committee Members Assigned'),
          error: e => this.actionError = e
        });
    }
  }

  markReviewed() {
    let finishReview: boolean;

    if (this.application.status == ApplicationStatus.REVIEW) {
      finishReview = true;
    } else if (this.application.status == ApplicationStatus.REVIEWED) {
      finishReview = false;
    } else {
      return; // not correct status for marking as review
    }

    this.applicationService.markReview(new ReviewApplicationRequest(this.application.applicationId, finishReview))
      .subscribe({
        next: response => {
          this.application.status = response.status;
          this.application.lastUpdated = new Date(response.lastUpdated);

          this.displayActionAlert((finishReview) ? 'Application marked as reviewed':'Application moved back to review');
        },
        error: e => this.actionError = e
      });
  }

  referApplication() {
    this.applicationService.referApplication(new ReferApplicationRequest(this.application.applicationId, this.application.editableFields, this.user.username))
      .subscribe({
        next: response => {
          this.application.referredBy = this.user;
          this.application.editableFields = response.editableFields;
          this.application.lastUpdated = new Date(response.lastUpdated);
          this.displayActionAlert('Application referred to applicant');
        },
        error: e => this.actionError = e
      });
  }

  acceptReferred() {
    console.log('Accept referred back')
  }

  rejectApplication() {
    console.log('Reject');
  }

  approveApplication() {
    console.log('Approve');
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

  terminateApplication(terminate: boolean) {
    if (terminate) {
      this.router.navigate(['applications']);
    }
  }
}
