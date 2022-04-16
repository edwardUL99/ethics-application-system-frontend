import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from '../../../alert/alert.component';
import { ApplicationService } from '../../application.service';
import { ViewingUser } from '../../applicationcontext';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ApplicationComments, Comment } from '../../models/applications/comment';
import { SubmittedApplicationResponse } from '../../models/requests/applicationresponse';
import { mapApplicationComments, resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { mapCommentToRequest, ReviewSubmittedApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { UpdateCommentRequest } from '../../models/requests/updatecommentrequest';
import { CommentDisplayComponent } from '../comment-display/comment-display.component';
import { QuestionViewComponent } from '../component/application-view.component';

/**
 * This component displays a form to leave comments
 */
@Component({
  selector: 'app-comments-display',
  templateUrl: './comments-display.component.html',
  styleUrls: ['./comments-display.component.css']
})
export class CommentsDisplayComponent implements OnInit, OnChanges {
  /**
   * The application the comment is being left on
   */
  @Input() application: Application;
  /**
   * The component view the comment is attached to
   */
  @Input() component: QuestionViewComponent;
  /**
   * Enables comment button to be displayed
   */
  @Input() enable: boolean;
  /**
   * The component ID the comments are attached to
   */
  componentId: string;
  /**
   * The form to create the comment
   */
  form: FormGroup;
  /**
   * Determine if the form is displayed
   */
  formDisplayed: boolean = false;
  /**
   * Determine if a comment can be created
   */
  createComment: boolean;
  /**
   * The alert message outlining the outcome of adding a comment
   */
  @ViewChild('addAlert')
  private addAlert: AlertComponent;
  /**
   * Determine if this component should be displayed
   */
  display: boolean;
  /**
   * The comment being rendered
   */
  @Input() comments: ApplicationComments;
  /**
   * The user viewing the application
   */
  @Input() viewingUser: ViewingUser;

  constructor(private fb: FormBuilder,
    private applicationService: ApplicationService, private cd: ChangeDetectorRef) {
      this.form = this.fb.group({
        comment: this.fb.control('', [Validators.required]),
        sharedApplicant: this.fb.control(''),
        sharedReviewer: this.fb.control('')
      });
    }

  ngOnInit(): void {}

  ngOnChanges(): void {
    if (!this.component.hideComments) {
      const status = resolveStatus(this.application.status);
      this.createComment = this.enable &&
        (this.viewingUser?.reviewer &&
        (status == ApplicationStatus.REVIEW) || status == ApplicationStatus.REVIEWED);
      
      if (!this.comments) {
        this.componentId = this.component.component.componentId;
        this.comments = this.application.comments?.[this.component.component.componentId];
      } else {
        this.componentId = this.comments.componentId;
      }

      if (this.application.status != ApplicationStatus.DRAFT && this.viewingUser?.reviewer) {
        this.display = true;
      } else if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REFERRED].indexOf(this.application.status) != -1) {
        this.display = true;
      } else {
        this.display = false;
      }
    }
  }

  toggleForm(explicit?: boolean) {
    if (explicit != undefined) {
      this.formDisplayed = explicit;
    } else {
      this.formDisplayed = !this.formDisplayed;
    }

    if (!this.formDisplayed) {
      this.form.reset();
    }
  }

  private displayAddAlert(message: string, error: boolean = false) {
    const alert = this.addAlert;
    
    if (error) {
      alert.alertType = 'alert-danger';
      alert.message = message;
      alert.show();
    } else {
      alert.alertType = 'alert-success';
      alert.message = message;
      alert.show();

      setTimeout(() => alert.hide(), 2000);
    }
  }

  private updateComments(requestComments: Comment[], alerter: () => void, error: (e: any) => void) {
    const mappedComments = requestComments.map(c => mapCommentToRequest(c));

    const request = new ReviewSubmittedApplicationRequest(this.application.applicationId, mappedComments);

    this.applicationService.updateReview(request)
      .subscribe({
        next: response => {
          const commentShape = response.comments;
          const mapped = mapApplicationComments(commentShape);
          this.application.comments = mapped;
          this.comments = mapped[this.componentId];
          alerter();
          this.toggleForm(false);
          this.cd.detectChanges();
        },
        error: error
      });
  }

  private getCheckboxBoolean(name: string) {
    let shared = this.form.get(name).value;

    if (shared == undefined || shared == '') {
      shared = false;
    } else {
      shared = true;
    }

    return shared;
  }

  addComment() {
    const value = this.form.get('comment').value;
    const shared = this.getCheckboxBoolean('sharedApplicant');
    const sharedReviewer = this.getCheckboxBoolean('sharedReviewer');

    const componentId = this.component.component.componentId;

    if (value) {
      let requestComments = [];
      requestComments.push(new Comment(undefined, this.component.context.viewingUser.user.username, value, componentId, [], new Date(), shared, false, sharedReviewer));
      this.updateComments(requestComments, () => this.displayAddAlert('Comment added successfully'), (e: any) => this.displayAddAlert(e, true));
    }
  }

  addSubComment(comment: Comment, subComment: Comment, alerter: () => void, error: (e: any) => void) {
    comment.subComments.push(subComment);
    this.updateComments([comment], alerter, error);
  }

  deleteComment(commentDisplay: CommentDisplayComponent) {
    let removeIndex = -1;

    for (let i = 0; i < this.comments.comments.length; i++) {
      let c1 = this.comments.comments[i];

      if (c1.id == commentDisplay.comment.id) {
        removeIndex = i;
        break;
      }
    }

    if (removeIndex != -1) {
      this.applicationService.patchComment(new UpdateCommentRequest(this.application?.applicationId, mapCommentToRequest(commentDisplay.comment), true))
        .subscribe({
          next: response => {
            if ('comments' in response) {
              const mapped = mapApplicationComments((response as SubmittedApplicationResponse).comments);
              this.application.comments[this.componentId] = mapped[this.componentId];
              this.comments = mapped[this.componentId];
              this.application.lastUpdated = new Date(response.lastUpdated);
            }
          },
          error: e => commentDisplay.editAlert.displayMessage(e, true)
        });
    }
  }
}
