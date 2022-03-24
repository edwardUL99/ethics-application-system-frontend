import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from '../../../alert/alert.component';
import { ApplicationService } from '../../application.service';
import { ViewingUser } from '../../applicationcontext';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { ApplicationComments, Comment } from '../../models/applications/comment';
import { mapApplicationComments, resolveStatus } from '../../models/requests/mapping/applicationmapper';
import { mapCommentToRequest, ReviewSubmittedApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { ApplicationViewComponent } from '../component/application-view.component';

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
  @Input() component: ApplicationViewComponent;
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
        comment: this.fb.control('', [Validators.required])
      });
    }

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.createComment = this.enable &&
      (this.viewingUser?.reviewer &&
      resolveStatus(this.application.status) == ApplicationStatus.REVIEW);
    
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

  toggleForm(explicit?: boolean) {
    if (explicit != undefined) {
      this.formDisplayed = explicit;
    } else {
      this.formDisplayed = !this.formDisplayed;
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

  addComment() {
    const value = this.form.get('comment').value;
    const componentId = this.component.component.componentId;

    if (value) {
      let requestComments = [];
      requestComments.push(new Comment(undefined, this.component.template.viewingUser.user.username, value, componentId, [], new Date()));
      this.updateComments(requestComments, () => this.displayAddAlert('Comment added successfully'), (e: any) => this.displayAddAlert(e, true));
    }
  }

  addSubComment(comment: Comment, subComment: Comment, alerter: () => void, error: (e: any) => void) {
    comment.subComments.push(subComment);
    this.updateComments([comment], alerter, error);
  }
}
