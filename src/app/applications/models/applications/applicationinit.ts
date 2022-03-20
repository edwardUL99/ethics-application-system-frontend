import { User } from '../../../users/user';
import { ApplicationStatus } from './applicationstatus';
import { ApplicationTemplate } from '../applicationtemplate';
import { AnswersMapping, CommentsMapping } from './types';
import { Application } from './application';
import { Comment } from './comment';
import { AssignedCommitteeMember } from './assignedcommitteemember';
import { AttachedFile } from './attachedfile';

/*
 * It is easier to work with Application instances in templates as a single class structure,
 * i.e no inheritance. To make the initialisation variable on application statuses, these initialisers
 * take on the inheritance structure and only initialise the fields associated with that application
 * state
 */

/**
 * An object mapping status to the list of allowed properties for that type
 */
export type AllowedKeys = {
  [key in ApplicationStatus]?: string[];
}

const allowedKeys: AllowedKeys = {};

const baseKeys: string[] = ['id', 'applicationId', 'user', 'applicationTemplate', 'answers', 'attachedFiles', 'lastUpdated', 'status'];
const submittedKeys: string[] = [...baseKeys];
submittedKeys.push('comments', 'assignedCommitteeMembers', 'finalComment', 'previousCommitteeMembers', 'submittedTime', 'approvalTime');
const referredKeys: string[] = [...submittedKeys];
referredKeys.push('editableFields', 'referredBy');

allowedKeys[ApplicationStatus.DRAFT] = baseKeys;

[ApplicationStatus.SUBMITTED, ApplicationStatus.RESUBMITTED, ApplicationStatus.REVIEW, 
  ApplicationStatus.REVIEWED, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED].forEach(status => allowedKeys[status] = submittedKeys);

allowedKeys[ApplicationStatus.REFERRED] = referredKeys;

/**
 * This class represents the base class for an initialiser to initialise an application
 */
export abstract class ApplicationInitialiser {
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
    public status: ApplicationStatus, public applicationTemplate: ApplicationTemplate,
    public answers: AnswersMapping, public attachedFiles: AttachedFile[], public lastUpdated: Date) {
      this.validateStatus(status);
    }

  /**
   * Initialise the application instance passed in
   */
  initialise(application: Application): void {
    const allowed = allowedKeys[this.status];
    const applicationKeys = Object.getOwnPropertyNames(application);

    Object.getOwnPropertyNames(this).forEach(property => {
      const value = this[property];

      if (typeof(value) != 'function') {
        if (applicationKeys.indexOf(property) == -1) {
          throw new Error(`Property ${property} does not exist in the class Application`);
        } else {
          const propertyValue = application[property];

          if (typeof(propertyValue) != 'function' && allowed.indexOf(property) == -1) {
            throw new Error(`Property ${property} not valid for this application type`);
          }
        }

        application[property] = value;
      }
    });
  }

  /**
   * Validate that the given status is valid for this given initialiser. If not valid, throw an error
   * @param status the status to validate
   */
  protected abstract validateStatus(status: ApplicationStatus): void;
}

/**
 * This initialiser is responsible for initialising the state for a DraftApplication
 */
export class DraftApplicationInitialiser extends ApplicationInitialiser {
  /**
   * Create an instance
   * @param id the database ID of the application
   * @param applicationId the ethics application ID
   * @param user the user creating the application
   * @param applicationTemplate the application template the application is based on
   * @param answers the answers to the application
   * @param attachedFiles any files attached to the application
   * @param lastUpdated the timestamp of when the application was last updated
   */
  constructor(id: number, applicationId: string, user: User,applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFile[], lastUpdated: Date) {
    super(id, applicationId, user, ApplicationStatus.DRAFT, applicationTemplate, answers, attachedFiles, lastUpdated);
  }

  protected validateStatus(status: ApplicationStatus): void {
    if (status != ApplicationStatus.DRAFT) {
      throw new Error('A DraftApplication can only have the DRAFT status');
    }
  }
}

/**
 * This class is responsible for initialising submitted applications
 */
export class SubmittedApplicationInitialiser extends ApplicationInitialiser {
  /**
   * Create an instance
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
   * @param submittedTime the time the application was submitted at
   * @param approvalTime the timestamp of when the application was approved if approval is granted
   */
  constructor(id: number, applicationId: string, user: User,
    status: ApplicationStatus, applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFile[], lastUpdated: Date,
    public comments: CommentsMapping, public assignedCommitteeMembers: AssignedCommitteeMember[], public finalComment: Comment,
    public previousCommitteeMembers: User[], public submittedTime: Date, public approvalTime: Date) {
    super(id, applicationId, user, status, applicationTemplate, answers, attachedFiles, lastUpdated);
  }
  
  protected validateStatus(status: ApplicationStatus): void {
    const allowedStatuses = [
      ApplicationStatus.SUBMITTED,
      ApplicationStatus.RESUBMITTED,
      ApplicationStatus.REVIEW,
      ApplicationStatus.REVIEWED,
      ApplicationStatus.APPROVED,
      ApplicationStatus.REJECTED
    ];

    if (allowedStatuses.indexOf(status) == -1) {
      throw new Error('Invalid status given to a submitted application, status given: ' + status);
    }
  }
}

/**
 * This initialiser is responsible for initialising a referred application
 */
export class ReferredApplicationInitialiser extends SubmittedApplicationInitialiser {
  /**
   * Create an instance
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
   * @param submittedTime the time the application was submitted at
   * @param approvalTime the timestamp of when the application was approved if approval is granted
   * @param editableFields the list of field IDs that can be edited
   * @param referredBy the user that referred the application
   */
  constructor(id: number, applicationId: string, user: User,
    status: ApplicationStatus, applicationTemplate: ApplicationTemplate,
    answers: AnswersMapping, attachedFiles: AttachedFile[], lastUpdated: Date,
    comments: CommentsMapping, assignedCommitteeMembers: AssignedCommitteeMember[], finalComment: Comment,
    previousCommitteeMembers: User[], submittedTime: Date, approvalTime: Date,
    public editableFields: string[], public referredBy: User) {
    super(id, applicationId, user, status, applicationTemplate, answers, attachedFiles, lastUpdated,
      comments, assignedCommitteeMembers, finalComment, previousCommitteeMembers, submittedTime, approvalTime);
  }

  protected validateStatus(status: ApplicationStatus): void {
    if (status != ApplicationStatus.REFERRED) {
      throw new Error('A ReferredApplication can only have the REFERRED status');
    }
  }
}