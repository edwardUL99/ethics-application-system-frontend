import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from '../../../alert/alert.component';
import { UserService } from '../../../users/user.service';
import { Application } from '../../models/applications/application';
import { ApplicationStatus } from '../../models/applications/applicationstatus';
import { Comment } from '../../models/applications/comment';
import { ApplicationViewComponent } from '../component/application-view.component';
import { CommentsDisplayComponent } from '../comments-display/comments-display.component';
import { Router } from '@angular/router';

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
   * Indicates if this comment is an approval comment
   */
  @Input() approvalComment: boolean = false;
  /**
   * Display a border around the comment
   */
  @Input() border: boolean = true;
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
  /**
   * The info of the user who created the comment
   */
  userInfo: UserInfo;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router) {
      this.subCommentForm = this.fb.group({
        comment: this.fb.control('', [Validators.required])
      });
    }

  ngOnInit(): void {
    const viewingUser = this.component?.template?.viewingUser;
    this.replyComment = viewingUser?.reviewer;

    if (this.application.status != ApplicationStatus.DRAFT && viewingUser?.reviewer) {
      this.display = true;
    } else if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REFERRED].indexOf(this.application.status) == -1) {
      this.display = true;
    } else if (this.approvalComment) {
      this.display = true;
    } else {
      this.display = false;
    }

    if (this.display) {
      this.loadUser(this.comment.username);
    }
  }

  private displayAddAlert(message: string, error: boolean = false) {
    this.addSubAlert.displayMessage(message, error);
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

  loadUser(user: string) {
    this.userService.getUser(user)
      .subscribe({
        next: response => this.userInfo = new UserInfo(response.name, user),
        error: e => {
          console.error(e);
          this.userInfo = new UserInfo(user, user);
        }
      });
  }

  formatDate(date: Date) {
    return date.toLocaleString();
  }

  navigateUser(username: string) {
    this.router.navigate(['profile'], {
      queryParams: {
        username: username
      }
    });
  }
}

/**
 * An info object for comments, i.e. their name and username
 */
class UserInfo {
  constructor(public name: string, public username: string) {}
}
