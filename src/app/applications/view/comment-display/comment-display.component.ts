import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AlertComponent } from '../../../alert/alert.component';
import { UserService } from '../../../users/user.service';
import { ApplicationService } from '../../application.service';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { Comment } from '../../models/applications/comment';
import { mapComment } from '../../models/requests/mapping/applicationmapper';
import { RequestComment, ReviewSubmittedApplicationRequest } from '../../models/requests/reviewapplicationrequest';
import { ApplicationViewComponent } from '../component/application-view.component';
import { CommentsDisplayComponent } from '../comments-display/comments-display.component';

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
   * The host comments display
   */
  @Input() hostDisplay: CommentsDisplayComponent;
  /**
   * The component view the comment is attached to
   */
  @Input() component: ApplicationViewComponent;
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
      this.subCommentForm = this.fb.group({
        comment: this.fb.control('', [Validators.required])
      });
    }

  ngOnInit(): void {
    const viewingUser = this.component.template?.viewingUser;
    this.replyComment = viewingUser?.reviewer;

    if (this.application.status != ApplicationStatus.DRAFT && viewingUser?.reviewer) {
      this.display = true;
    } else if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REFERRED].indexOf(this.application.status) == -1) {
      this.display = true;
    } else {
      this.display = false;
    }
  }

  private displayAddAlert(message: string, error: boolean = false, subComment: boolean = false) {
    const alert = (subComment) ? this.addSubAlert : this.addAlert;
    alert.displayMessage(message, error);
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
      this.hostDisplay.addSubComment(this.comment, subComment, () => this.displayAddAlert('Replied Successfully'), (e: any) => this.displayAddAlert(e, true));
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
