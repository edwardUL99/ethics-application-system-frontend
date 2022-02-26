import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Observable, retry } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { UserResponse } from '../../../users/responses/userresponse';
import { UserService } from '../../../users/user.service';
import { ApplicationService } from '../../application.service';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { Comment } from '../../models/applications/comment';
import { mapComment } from '../../models/requests/mapping/applicationmapper';
import { RequestComment, ReviewSubmittedApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { ApplicationViewComponent } from '../component/application-view.component';

/**
 * This component displays a form to leave a comment 
 */
@Component({
  selector: 'app-comment-display',
  templateUrl: './comment-display.component.html',
  styleUrls: ['./comment-display.component.css']
})
export class CommentDisplayComponent implements OnInit {
  /**
   * The application the comment is being left on
   */
  @Input() application: Application;
  /**
   * If this comment is a sub-comment, this field will hold the parent comment
   */
  @Input() parentComment: CommentDisplayComponent;
  /**
   * The component view the comment is attached to
   */
  @Input() component: ApplicationViewComponent;
  /**
   * The form to create the comment
   */
  form: FormGroup;
  /**
   * Determine if the form is displayed
   */
  formDisplayed: boolean = false;
  /**
   * The alert message outlining the outcome of adding a comment
   */
  @ViewChild('addAlert')
  private addAlert: AlertComponent;
  /**
   * The alert for adding a sub comment
   */
  @ViewChild('addSubAlert')
  private addSubAlert: AlertComponent;
  /**
   * A form to leave sub-comments if this comment is not a sub-comment
   */
  subCommentForm: FormGroup;
  /**
   * Determine if the sub comment form is displayed
   */
  subCommentFormDisplayed: boolean = false;
  /**
   * Determine if no comment exists and a button to create the comment should be displayed
   */
  createComment: boolean;
  /**
   * Determine if you can reply to the comment
   */
  replyComment: boolean;
  /**
   * Determine if this component should be displayed
   */
  display: boolean;
  /**
   * The comment being rendered
   */
  @Input() comment: Comment;

  constructor(private fb: FormBuilder,
    private applicationService: ApplicationService,
    private userService: UserService) {
      this.form = this.fb.group({
        comment: this.fb.control('', [Validators.required])
      });

      this.subCommentForm = this.fb.group({
        comment: this.fb.control('', [Validators.required])
      });
    }

  ngOnInit(): void {
    const viewingUser = this.component.template?.viewingUser;

    this.createComment = this.parentComment == undefined && viewingUser?.reviewer && 
      !(this.component.component.componentId in this.application.comments);
    
    if (!this.comment) {
      this.comment = this.application.comments?.[this.component.component.componentId];
    }

    this.replyComment = viewingUser?.reviewer && !this.createComment;

    if (this.application.status != ApplicationStatus.DRAFT && this.component.template.viewingUser.reviewer) {
      this.display = true;
    } else if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REFERRED].indexOf(this.application.status) == -1) {
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

  private displayAddAlert(message: string, error: boolean = false, subComment: boolean = false) {
    const alert = (subComment) ? this.addSubAlert : this.addAlert;
    
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

  addComment() {
    const value = this.form.get('comment').value;
    const componentId = this.component.component.componentId;

    if (value) {
      const request = new ReviewSubmittedApplicationRequest(this.application.applicationId,
        [{
          id: undefined,
          username: this.component.template.viewingUser.user.username,
          comment: value,
          subComments: [],
          componentId: componentId,
          createdAt: new Date().toISOString()
        }]);

      this.applicationService.updateReview(request)
        .subscribe({
          next: response => {
            const commentShape = response.comments[componentId];
            const comment = mapComment(commentShape);
            this.application.comments[componentId] = comment;
            this.comment = comment;
            this.displayAddAlert('Comment added successfully');
            this.toggleForm(false);
          },
          error: e => this.displayAddAlert(e, true)
        });
    }
  }

  private convertCommentToRequest(comment: Comment): RequestComment {
    const mapped: RequestComment = {id: comment.id, componentId: comment.componentId, username: comment.username, comment: comment.comment, subComments: [], createdAt: comment.createdAt.toISOString()};

    for (let sub of comment.subComments) {
      mapped.subComments.push(this.convertCommentToRequest(sub));
    }

    return mapped;
  }

  toggleSubCommentForm(explicit?: boolean) {
    if (explicit != undefined) {
      this.subCommentFormDisplayed = explicit;
    } else {
      this.subCommentFormDisplayed = !this.subCommentFormDisplayed;
    }
  }

  addSubComment() {
    const value = this.subCommentForm.get('comment').value;
    const componentId = this.comment.componentId;

    if (value) {
      const subComment: Comment = new Comment(undefined, this.component.template.viewingUser.user.username, value, componentId, [], new Date());
      const mapped: RequestComment = this.convertCommentToRequest(this.comment);
      mapped.subComments.push(this.convertCommentToRequest(subComment));

      const request = new ReviewSubmittedApplicationRequest(this.application.applicationId, [mapped]);
      this.applicationService.updateReview(request)
        .subscribe({
          next: response => {
            const commentShape = response.comments[componentId];
            const comment = mapComment(commentShape);
            this.application.comments[componentId] = comment;
            this.comment = comment;
            this.displayAddAlert('Replied successfully', false, false);
            this.toggleSubCommentForm(false);
          },
          error: e => this.displayAddAlert(e, true, true)
        });
    }
  }

  loadUser(user: string): Observable<UserInfo> {
    return new Observable<UserInfo>(observer => {
      this.userService.getUser(user)
        .subscribe({
          next: response => {
            observer.next(new UserInfo(response.name, user));
            observer.complete();
          },
          error: () => {
            observer.next(new UserInfo(undefined, user));
            observer.complete();
          }
        });
    })
  }

  formatDate(date: Date) {
    return date.toLocaleString();
  }
}

/**
 * An info object for comments, i.e. their name and username
 */
class UserInfo {
  constructor(public name: string, public username: string) {}
}
