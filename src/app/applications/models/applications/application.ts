import { User } from '../../../users/user';
import { ApplicationTemplate } from '../applicationtemplate';
import { Answer } from './answer';
import { ApplicationStatus } from './applicationstatus';
import { AttachedFile } from './attachedfile';
import { Comment } from './comment';

/**
 * Mapping of component ID to answer
 */
export type AnswersMapping = {
  [key: string]: Answer;
}

/**
 * Mapping of component ID to attached file
 */
export type AttachedFilesMapping = {
  [key: string]: AttachedFile
}

/**
 * This class represents a base application
 */
export abstract class Application {
  /**
   * Create an application instance
   * @param id the database ID of the application
   * @param applicationId the ethics application ID
   * @param user the user creating the application
   * @param status the status of the application
   * @param applicationTemplate the application template the application is based on
   * @param answers the answers to the application
   * @param attachedFiles any files attached to the application
   * @param lastUpdated the timestamp of when the application was last updated
   */
  constructor(public id: number, public applicationId: string, public user: User,
    protected status: ApplicationStatus, public applicationTemplate: ApplicationTemplate,
    public answers: AnswersMapping, public attachedFiles: AttachedFilesMapping, public lastUpdated: Date) {
      this.setStatus(status);
    }

  /**
   * Attach the given file to the application
   * @param file the file to attach
   */
  attachFile(file: AttachedFile) {
    this.attachedFiles[file.componentId] = file;
  }

  /**
   * Sets the status and validates that the status is valid for the given application
   * @param status the status to set
   */
  abstract setStatus(status: ApplicationStatus): any;
}

/**
 * This class represents an application that is a draft
 */
export class DraftApplication extends Application {
  /**
   * Create an application instance
   * @param id the database ID of the application
   * @param applicationId the ethics application ID
   * @param user the user creating the application
   * @param status the status of the application
   * @param applicationTemplate the application template the application is based on
   * @param answers the answers to the application
   * @param attachedFiles any files attached to the application
   * @param lastUpdated the timestamp of when the application was last updated
   */
  constructor(id: number, applicationId: string, user: User,
    status: ApplicationStatus, applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFilesMapping, lastUpdated: Date) {
    super(id, applicationId, user, status, applicationTemplate, answers, attachedFiles, lastUpdated);
  }

  setStatus(status: ApplicationStatus) {
    if (status != ApplicationStatus.DRAFT) {
      throw new Error('A DraftApplication can only have the DRAFT status');
    }

    this.status = status;
  }
}

/**
 * This type represents a mapping of component ID to a comment
 */
export type CommentsMapping = {
  [key: string]: Comment;
}

/**
 * This class represents an application that has been submitted
 */
export class SubmittedApplication extends Application {
  /**
   * Create an application instance
   * @param id the database ID of the application
   * @param applicationId the ethics application ID
   * @param user the user creating the application
   * @param status the status of the application
   * @param applicationTemplate the application template the application is based on
   * @param answers the answers to the application
   * @param attachedFiles any files attached to the application
   * @param lastUpdated the timestamp of when the application was last updated
   * @param comments the mapping of comments on the application
   * @param assignedCommitteeMembers committee members that have been assigned to the application
   * @param finalComment the last comment left on the application
   * @param previousCommitteeMembers the list of any committee members that were previously assigned to the application but it was referred
   * and resubmitted
   * @param approvalTime the timestamp of when the application was approved if approval is granted
   */
  constructor(id: number, applicationId: string, user: User,
    status: ApplicationStatus, applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFilesMapping, lastUpdated: Date,
    public comments: CommentsMapping, public assignedCommitteeMembers: User[], public finalComment: Comment,
    public previousCommitteeMembers: User[], public approvalTime: Date) {
    super(id, applicationId, user, status, applicationTemplate, answers, attachedFiles, lastUpdated);
  }

  assignCommitteeMember(user: User) {
    this.assignedCommitteeMembers.push(user);
  }

  /**
   * Add the comment to the application
   * @param comment the comment to add
   */
  addComment(comment: Comment) {
    this.comments[comment.componentId] = comment;
  }

  setStatus(status: ApplicationStatus) {
    const allowedStatuses = [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.RESUBMITTED,
      ApplicationStatus.REVIEW,
      ApplicationStatus.REVIEWED,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED
    ];

    if (allowedStatuses.indexOf(status) == -1) {
      throw new Error('Invalid status given to a submitted application');
    }

    this.status = status;
  }
}

/**
 * This class represents an application that has been referred to the applicant
 */
export class ReferredApplication extends SubmittedApplication {
  /**
   * Create an application instance
   * @param id the database ID of the application
   * @param applicationId the ethics application ID
   * @param user the user creating the application
   * @param status the status of the application
   * @param applicationTemplate the application template the application is based on
   * @param answers the answers to the application
   * @param attachedFiles any files attached to the application
   * @param lastUpdated the timestamp of when the application was last updated
   * @param comments the mapping of comments on the application
   * @param assignedCommitteeMembers committee members that have been assigned to the application
   * @param finalComment the last comment left on the application
   * @param previousCommitteeMembers the list of any committee members that were previously assigned to the application but it was referred
   * and resubmitted
   * @param approvalTime the timestamp of when the application was approved if approval is granted
   * @param editableFields the list of field IDs that can be edited
   * @param referredBy the user that referred the application
   */
  constructor(id: number, applicationId: string, user: User,
    status: ApplicationStatus, applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFilesMapping, lastUpdated: Date,
    comments: CommentsMapping, assignedCommitteeMembers: User[], finalComment: Comment,
    previousCommitteeMembers: User[], approvalTime: Date,
    public editableFields: string[], public referredBy: User) {
    super(id, applicationId, user, status, applicationTemplate, answers, attachedFiles, lastUpdated,
      comments, assignedCommitteeMembers, finalComment, previousCommitteeMembers, approvalTime);
  }

  setStatus(status: ApplicationStatus): void {
    if (status != ApplicationStatus.REFERRED) {
      throw new Error('A ReferredApplication can only have the REFERRED status');
    }

    this.status = status;
  }
}