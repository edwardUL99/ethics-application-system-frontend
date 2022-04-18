import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from '../../../../alert/alert.component';
import { AnswerRequestService } from '../../../answer-request.service';
import { ApplicationContext, ViewingUser } from '../../../applicationcontext';
import { AnswerRequest } from '../../../models/applications/answer-requests/answerrequest';
import { StatusDescpriptions } from '../../../models/applications/applicationstatus';
import { AnswersMapping } from '../../../models/applications/types';
import { RespondAnswerRequest } from '../../../models/requests/answer-requests/requests';
import { resolveStatus } from '../../../models/requests/mapping/applicationmapper';
import { QuestionChangeEvent } from '../../component/application-view.component';

/**
 * This component displays a request to answer all the requested components
 */
@Component({
  selector: 'app-answer-request',
  templateUrl: './answer-request.component.html',
  styleUrls: ['./answer-request.component.css']
})
export class AnswerRequestComponent implements OnInit {
  /**
   * The request to render
   */
  @Input() request: AnswerRequest;
  /**
   * The IDs of the components requested
   */
  requestComponents: string[];
  /**
   * The ID of the request to load
   */
  id: number;
  /**
   * The form object to use for the components
   */
  form: FormGroup;
  /**
   * The user viewing the application
   */
  viewingUser: ViewingUser;
  /**
   * An error that occurred on load
   */
  loadError: string;
  /**
   * An alert for notifying of error/info messages
   */
  @ViewChild('submitAlert')
  private submitAlert: AlertComponent;
  /**
   * The set answers
   */
  private answers: AnswersMapping = {};
  /**
   * The descriptions of the application statuses
   */
  readonly statusDescriptions = StatusDescpriptions;

  constructor(private cd: ChangeDetectorRef, 
    private applicationContext: ApplicationContext,
    private route: ActivatedRoute,
    private requestService: AnswerRequestService,
    private router: Router,
    private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParams['id'];

    if (this.id) {
      this.loadRequest();
    } else {
      this.loadError = 'You must specify the ID of the request';  
    }
  }

  loadRequest() {
    this.requestService.getRequest(this.id)
      .subscribe({
        next: request => {
          this.request = request;
          this.requestComponents = request.components.map(c => c.componentId);
          this.loadViewingUser();
        },
        error: e => this.loadError = e
      });
  }

  loadViewingUser() {
    this.applicationContext.getViewingUser(true)
      .subscribe({
        next: user => {
          this.viewingUser = user;
          this.viewingUser.givingInput = true;
          this.viewingUser.applicant = this.request?.application?.user?.username == user.user.username;
          this.cd.detectChanges();
        },
        error: e => this.loadError = e
      });
  }

  getStatus() {
    return resolveStatus(this.request?.application?.status);
  }

  questionChange(event: QuestionChangeEvent) {
    const value = event.view.value();

    if (Array.isArray(value)) {
      value.forEach(v => {
        if (v) {
          if (!v.empty()) {
            this.answers[v.componentId] = v;
          } else {
            delete this.answers[v.componentId];
          }
        }
      });
    } else {
      if (value) {
        if (!value.empty()) {
          this.answers[value.componentId] = value;
        } else {
          delete this.answers[value.componentId];
        }
      }
    }
  }

  submit() {
    const request = new RespondAnswerRequest(this.id, this.answers);

    this.requestService.submitAnswers(request)
      .subscribe({
        next: () => {
          this.submitAlert.displayMessage('Answers Submitted Successfully. Redirecting...', false, false);
          setTimeout(() => this.router.navigate(['answer-requests']), 1500);
        },
        error: e => this.submitAlert.displayMessage(e, true)
      });
  }
}
