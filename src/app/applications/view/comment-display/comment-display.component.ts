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
import { ViewingUser } from '../../applicationcontext';
import { ApplicationService } from '../../application.service';
import { UpdateCommentRequest } from '../../models/requests/updatecommentrequest';
import { mapCommentToRequest } from '../../models/requests/reviewapplicationrequest';

export function copyComment(comment: Comment): Comment {
  return new Comment(comment.id, comment.username, comment.comment, comment.componentId, comment.subComments,
    comment.createdAt, comment.sharedApplicant, comment.edited);
}

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
  /**
   * Determines if comment is shared with applicant
   */
  sharedApplicant: boolean;
  /**
   * Determines if the comment is shared with reviewers
   */
  sharedReviewer: boolean;
  /**
   * User viewing the application
   */
  viewingUser: ViewingUser;
  /** 
   * Determine if the user should be allowed the comment to be edited
   */
  allowEdit: boolean;
  /**
   * A form group to edit a comment
   */
  editCommentForm: FormGroup;
  /**
   * Determine if edit should be displayed
   */
  editDisplayed: boolean;
  /**
   * A new comment instance being edited to allow restoration
   */
  editingComment: Comment;
  /**
   * Determines if the delete confirmation is displayed
   */
  deleteConfirmDisplayed: boolean;
  /**
   * The alert for editing comments
   */
  @ViewChild('editAlert')
  editAlert: AlertComponent;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private applicationService: ApplicationService) {
  }

  private initDisplay(viewingUser: ViewingUser) {
    if (this.application.status != ApplicationStatus.DRAFT && viewingUser?.reviewer) {
      this.display = true;
    } else if ([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.REFERRED].indexOf(this.application.status) != -1) {
      this.display = true;
    } else if (this.approvalComment) {
      this.display = true;
    } else {
      this.display = false;
    }
  }

  ngOnInit(): void {
    this.viewingUser = this.component?.context?.viewingUser;
    this.replyComment = this.viewingUser?.reviewer;

    this.initDisplay(this.viewingUser);

    if (this.display) {
      this.loadUser(this.comment.username);
    }

    if (this.parentComment) {
      this.sharedApplicant = this.parentComment.comment.sharedApplicant;
      this.sharedReviewer = this.parentComment.comment.sharedReviewer;
    } else {
      this.sharedApplicant = this.comment.sharedApplicant;
      this.sharedReviewer = this.comment.sharedReviewer;
    }

    this.subCommentForm = this.fb.group({
      comment: this.fb.control('', [Validators.required])
    });

    this.editCommentForm = this.fb.group({
      comment: this.fb.control(this.comment.comment, [Validators.required]),
      sharedApplicant: this.fb.control((this.sharedApplicant) ? 'true':''),
      sharedReviewer: this.fb.control((this.sharedReviewer) ? 'true':'')
    });
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
      const subComment: Comment = new Comment(undefined, this.viewingUser.user.username, value, componentId, [], new Date());
      this.hostDisplay.addSubComment(this.comment, subComment, () => this.displayAddAlert('Replied Successfully'), (e: any) => this.displayAddAlert(e, true));
    }
  }

  private replaceSubComment(comment: Comment, subComment: Comment) {
    for (let i = 0; i < comment.subComments.length; i++) {
      if (comment.subComments[i].id == subComment.id) {
        comment.subComments[i] = subComment;
        break;
      }
    }
  }

  private getUpdatedComment() {
    let updated: Comment;

    if (this.parentComment) {
      const parent = copyComment(this.parentComment.comment);
      this.replaceSubComment(parent, this.editingComment);
      updated = parent;
    } else {
      updated = this.editingComment;
    }

    return updated;
  }

  get commentField() {
    return this.editCommentForm.get('comment');
  }

  get sharedApplicantField() {
    return this.editCommentForm.get('sharedApplicant');
  }

  get sharedReviewerField() {
    return this.editCommentForm.get('sharedReviewer');
  }

  toggleEditComment(explicit?: boolean) {
    if (explicit != undefined) {
      this.editDisplayed = false;
    } else {
      this.editDisplayed = !this.editDisplayed;
    }

    if (!this.editDisplayed) {
      this.editAlert?.hide();
      this.editCommentForm.reset();
    } else {
      this.commentField.setValue(this.comment.comment);
      this.sharedApplicantField.setValue((this.sharedApplicant) ? 'true':'');
      this.sharedReviewerField.setValue((this.sharedReviewer) ? 'true':'');
    }
  }

  private copySubCommentsList(subComments: Comment[]) {
    const list: Comment[] = [];
    subComments.forEach(c => list.push(c));

    return list;
  }

  deleteComment(confirmed?: boolean) {
    if (confirmed) {
      if (!this.parentComment) {
        this.hostDisplay.deleteComment(this);
      } else {
        const editing = copyComment(this.parentComment.comment);
        editing.subComments = this.copySubCommentsList(editing.subComments);
        let index = -1;

        for (let i = 0; i < editing.subComments.length; i++) {
          if (editing.subComments[i].id == this.comment.id) {
            index = i;
            break;
          }
        }

        if (index != -1) {
          editing.subComments.splice(index, 1);
          // when deleting a sub-comment, we simply update the parent comment with the sub-comment removed, so don't delete the parent
          const request = new UpdateCommentRequest(this.application.applicationId, mapCommentToRequest(editing), false);

          this.applicationService.patchComment(request)
            .subscribe({
              next: () => this.parentComment.comment.subComments = editing.subComments,
              error: e => this.editAlert.displayMessage(e, true)
            });
        }

        this.deleteConfirmDisplayed = false;
      }
    } else {
      this.deleteConfirmDisplayed = !this.deleteConfirmDisplayed;
    }
  }

  private getCheckboxBoolean(name: string) {
    let shared = this.editCommentForm.get(name).value;

    if (shared == undefined || shared == '') {
      shared = false;
    } else {
      shared = true;
    }

    return shared;
  }

  editComment() {
    const value = this.commentField.value;
    const sharedApplicant = this.getCheckboxBoolean('sharedApplicant');
    const sharedReviewer = this.getCheckboxBoolean('sharedReviewer');
    const commentChanged = value != this.comment.comment;
    const sharedChanged = sharedApplicant != this.sharedApplicant || sharedReviewer != this.sharedReviewer;

    if (value && (commentChanged || sharedChanged)) {
      const editing = copyComment(this.comment);
      editing.createdAt = new Date();
      editing.comment = value;
      editing.edited = commentChanged;
      editing.sharedApplicant = sharedApplicant;
      editing.sharedReviewer = sharedReviewer;
      this.editingComment = editing;
      const updated = this.getUpdatedComment();
      const request = new UpdateCommentRequest(this.application.applicationId, mapCommentToRequest(updated), false);

      this.applicationService.patchComment(request)
        .subscribe({
          next: () => {
            this.toggleEditComment(false);
            this.comment = this.editingComment;

            if (sharedChanged) {
              this.sharedApplicant = this.comment.sharedApplicant;
              this.sharedReviewer = this.comment.sharedReviewer;
            }
          },
          error: e => this.editAlert.displayMessage(e, true)
        });
    } else {
      this.toggleEditComment(false);
    }
  }

  loadUser(user: string) {
    this.userService.getUser(user)
      .subscribe({
        next: response => {
          this.userInfo = new UserInfo(response.name, user);
          this.allowEdit = user == this.viewingUser?.user?.username || this.viewingUser?.admin;
        },
        error: e => {
          console.error(e);
          this.userInfo = new UserInfo(user, user);
        }
      });
  }

  formatDate(date: Date) {
    let dateStr = date.toLocaleString();
    let edited = (this.comment.edited) ? ' (edited)' : '';

    return dateStr + edited;
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
  constructor(public name: string, public username: string) { }
}
