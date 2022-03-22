import { User } from '../../../users/user';
import { ApplicationTemplate } from '../applicationtemplate';
import { ApplicationStatus } from './applicationstatus';
import { AttachedFile } from './attachedfile';
import { ApplicationComments, Comment } from './comment';
import { ApplicationInitialiser } from './applicationinit';
import { AnswersMapping, CommentsMapping } from './types';
import { AssignedCommitteeMember } from './assignedcommitteemember';

/**
 * This class represents an Application in the system.
 * Construct an instance by passing an initialiser into the cretae method
 */
export class Application {
  /**
   * The database ID of the application
   */
  id: number = undefined;
  /**
   * The ethics application ID
   */
  applicationId: string = undefined;
  /**
   * The user creating the application
   */
  user: User = undefined;
  /**
   * The status of the application
   */
  status: ApplicationStatus = undefined;
  /**
   * The application template the application is based on
   */
  applicationTemplate: ApplicationTemplate = undefined;
  /**
   * The answers to the application
   */
  answers: AnswersMapping = undefined;
  /**
   * Any files attached to the application
   */
  attachedFiles: AttachedFile[] = undefined;
  /**
   * The timestamp of when the application was last updated
   */
  lastUpdated: Date = undefined;
  /**
   * The mapping of comments on the application
   */
  comments: CommentsMapping = undefined;
  /**
   * Committee members that have been assigned to the application
   */
  assignedCommitteeMembers: AssignedCommitteeMember[] = undefined;
  /**
   * The last comment left on the application
   */
  finalComment: Comment = undefined;
  /**
   * The list of any committee members that were previously assigned to the application but it was referred
   */
  previousCommitteeMembers: User[] = undefined;
  /**
   * The time the application was submitted at
   */
  submittedTime: Date = undefined;
  /**
   * The timestamp of when the application was approved if approval is granted
   */
  approvalTime: Date = undefined;
  /**
   * The list of field IDs that can be edited
   */
  editableFields: string[] = undefined;
  /**
   * The user that referred the application
   */
  referredBy: User = undefined;

  /**
   * Prevent external instantiation
   */
  private constructor() {}

  /**
   * Create an application instance and initialise it with the given initialiser
   * @param initialiser the initialiser to initialise the application with
   */
  static create(initialiser: ApplicationInitialiser): Application {
    const application = new Application();
    initialiser.initialise(application);

    return application;
  }

  /**
   * Attach the given file to the application
   * @param file the file to attach
   */
  attachFile(file: AttachedFile) {
    this.attachedFiles.push(file);
  }

  /**
   * Assign the user as a committee member
   * @param user the user to assign
   */
   assignCommitteeMember(user: User) {
    this.assignedCommitteeMembers.push(new AssignedCommitteeMember(undefined, this.applicationId, user, false));
  }

  /**
   * Add the comment to the application
   * @param comment the comment to add
   */
  addComment(comment: Comment) {
    const comments = this.comments[comment.componentId];

    if (comments) {
      comments.comments.push(comment);
    } else {
      this.comments[comment.componentId] = new ApplicationComments(undefined, comment.componentId, [comment]);
    }
  }
}