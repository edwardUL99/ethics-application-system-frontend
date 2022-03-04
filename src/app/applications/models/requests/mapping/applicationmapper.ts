import { Application } from "../../applications/application";
import { AnswersMapping, AttachedFilesMapping, CommentsMapping } from "../../applications/types";
import { DraftApplicationInitialiser, SubmittedApplicationInitialiser, ReferredApplicationInitialiser } from "../../applications/applicationinit";
import { ApplicationResponse, DraftApplicationResponse, ReferredApplicationResponse, SubmittedApplicationResponse } from "../applicationresponse";
import { catchError, Observable, Observer, throwError } from 'rxjs';
import { Answer } from "../../applications/answer";
import { AttachedFile } from "../../applications/attachedfile";
import { UserService } from '../../../../users/user.service';
import { InjectorService } from '../../../../injector.service';
import { ApplicationTemplateService } from '../../../application-template.service';
import { getErrorMessage, joinAndWait } from "../../../../utils";
import { User } from "../../../../users/user";
import { ApplicationTemplate } from "../../applicationtemplate";
import { Comment } from "../../applications/comment";
import { AssignedCommitteeMemberResponse, CommentShape } from "../shapes";
import { AnswersMapping as ResponseAnswersMapping } from "../applicationresponse";
import { AttachedFilesMapping as ResponseAttachedFilesMapping } from "../applicationresponse";
import { CommentsMapping as ResponseCommentsMapping } from "../applicationresponse";
import { ApplicationStatus } from "../../applications/applicationstatus";
import { UserResponse, userResponseMapper } from "../../../../users/responses/userresponse";
import { AssignedCommitteeMember } from '../../applications/assignedcommitteemember';
import { HttpErrorResponse } from "@angular/common/http";

/**
 * This interface represents a mapper for mapping an application response to an application
 */
export interface ApplicationResponseMapper {
  /**
   * Map the response to an application
   * @param response the response to map
   */
  map(response: ApplicationResponse): Observable<Application>;
}

/**
 * An enum of keys for the response mapper
 */
export enum ResponseMapperKeys {
  DRAFT,
  SUBMITTED,
  REFERRED,
  RESUBMITTED
}

/**
 * The type for a map containing registered mappers
 */
export type ApplicationResponseMappers = {
  [key in ResponseMapperKeys]?: ApplicationResponseMapper
}

/**
 * A mapping of application status to response mapper key
 */
export type StatusToKey = {
  [key in ApplicationStatus]?: ResponseMapperKeys
};

/**
 * The global instance of mappers
 */
const _mappers: ApplicationResponseMappers = {};

const _statusMapping: StatusToKey = {};

_statusMapping[ApplicationStatus.DRAFT] = ResponseMapperKeys.DRAFT;
_statusMapping[ApplicationStatus.REFERRED] = ResponseMapperKeys.REFERRED;
_statusMapping[ApplicationStatus.RESUBMITTED] = ResponseMapperKeys.RESUBMITTED;
[ApplicationStatus.SUBMITTED, ApplicationStatus.REVIEW, ApplicationStatus.REVIEWED, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED]
  .forEach(status => _statusMapping[status] = ResponseMapperKeys.SUBMITTED);

/**
 * Register a response mapper with the provided key
 * @param key the key to register the response mapper with
 * @returns the decorator
 */
export function MapApplicationResponse(key: ResponseMapperKeys | ResponseMapperKeys[]) {
  return <T extends ApplicationResponseMapper>(target: new () => T): new () => T => {
    let keys: ResponseMapperKeys[] = [];

    if (!Array.isArray(key)) {
      keys.push(key);
    } else {
      keys = key as ResponseMapperKeys[];
    }

    const instance = new target();
    for (let mapperKey of keys) {
      _mappers[mapperKey] = instance;
    }

    return target;
  }
}

/**
 * Get a response mapper for the given key
 * @param key the key for the response mapper or application status that will be mapped to a key
 */
export function getResponseMapper(key: ResponseMapperKeys | ApplicationStatus): ApplicationResponseMapper {
  if (ResponseMapperKeys[key]) {
    return _mappers[key];
  } else {
    return _mappers[_statusMapping[ApplicationStatus[key]]];
  }
}

/**
 * A class representing a resolved user and template
 */
class ResolvedUserTemplate {
  constructor(public user: User, public template: ApplicationTemplate) {}
}

function handleError(e: HttpErrorResponse) {
  return throwError(() => getErrorMessage(e));
}

/**
 * Load the user and template in parallel
 * @param observer the observer being used to pass the application to
 * @param response the response being mapped
 * @param subscriber the subscriber function to call when the template and user is loaded
 */
function loadUserAndTemplate(observer: Observer<Application>, response: ApplicationResponse, subscriber: (r: ResolvedUserTemplate) => void) {
  const injector: InjectorService = InjectorService.getInstance();
  const userService: UserService = injector.inject(UserService);
  const templateService: ApplicationTemplateService = injector.inject(ApplicationTemplateService);

  const observables: Observable<any>[] = [userService.getUser(response.username).pipe(catchError(handleError)), templateService.getTemplate(response.templateId)];
  joinAndWait(observables).subscribe({
    next: resolved => {
      const user = userResponseMapper(resolved[0]);
      const template = resolved[1] as ApplicationTemplate;
      subscriber(new ResolvedUserTemplate(user, template));
    },
    error: e => {
      observer.error(e)
    }
  })
}

/**
 * Map response answers to answer instances
 * @param answers the answers to map
 */
export function mapAnswers(answers: ResponseAnswersMapping): AnswersMapping {
  const mappedAnswers: AnswersMapping = {};

  Object.keys(answers).forEach(key => {
    const answer = answers[key];
    mappedAnswers[answer.componentId] = new Answer(answer.id, answer.componentId, answer.value, answer.valueType);
  });

  return mappedAnswers;
}

/**
 * Map response attached files to attached file instances
 * @param attachedFiles the files to map
 */
export function mapAttachedFiles(attachedFiles: ResponseAttachedFilesMapping): AttachedFilesMapping {
  const mappedAttachedFiles: AttachedFilesMapping = {};

  Object.keys(attachedFiles).forEach(key => {
    const attachedFile = attachedFiles[key];
    mappedAttachedFiles[attachedFile.componentId] = new AttachedFile(attachedFile.id, attachedFile.filename, attachedFile.directory, attachedFile.componentId);
  });

  return mappedAttachedFiles;
}

/**
 * Map response comments to comment instances
 * @param comments the comments to map
 */
export function mapComments(comments: ResponseCommentsMapping): CommentsMapping {
  const mappedComments: CommentsMapping = {};

  Object.keys(comments).forEach(key => {
    const comment = comments[key];
    mappedComments[comment.componentId] = mapComment(comment);
  });

  return mappedComments;
}

/**
 * Recursively map the comment and all subComments
 * @param comment the main comment to map
 */
export function mapComment(comment: CommentShape): Comment {
  if (comment) {
    const newComment: Comment = new Comment(comment.id, comment.username, comment.comment, comment.componentId, [], new Date(comment.createdAt));

    for (let sub of comment.subComments) {
      newComment.subComments.push(mapComment(sub));
    }

    return newComment;
  } else {
    return undefined;
  }
}

/**
 * This class maps a draft application
 */
@MapApplicationResponse(ResponseMapperKeys.DRAFT)
class DraftApplicationResponseMapper implements ApplicationResponseMapper {
  private loadUserAndTemplate(observer: Observer<Application>, response: DraftApplicationResponse, answers: AnswersMapping, attachedFiles: AttachedFilesMapping) {
    loadUserAndTemplate(observer, response,
      value => {
        observer.next(Application.create(new DraftApplicationInitialiser(response.dbId, response.id, value.user, 
        value.template, answers, attachedFiles, new Date(response.lastUpdated))));
        observer.complete();
      });
  }

  map(response: DraftApplicationResponse): Observable<Application> {
    return new Observable<Application>(observer => {
      const answers: AnswersMapping = mapAnswers(response.answers);
      const attachedFiles: AttachedFilesMapping = mapAttachedFiles(response.attachedFiles);

      this.loadUserAndTemplate(observer, response, answers, attachedFiles);
    });
  }
}

/**
 * Map the given array of responses to user objects
 * @param array the array of user responses
 */
function mapUsersArray(array: UserResponse[]): User[] {
  return array.map(userResponseMapper);
}

/**
 * Map the AssignedCommitteeMemberResponse to an observable of a loaded AssignedCommitteeMember
 * @param v the assigned committee member response
 * @param userService the user service instance retrieved from DI
 * @returns the observable instance
 */
function assignedMemberObservableMapper(v: AssignedCommitteeMemberResponse, userService: UserService): Observable<AssignedCommitteeMember> {
  return new Observable<AssignedCommitteeMember>(observer => {
    userService.getUser(v.username).pipe(catchError(handleError))
      .subscribe({
        next: user => {
          const mapped = userResponseMapper(user);
          observer.next(new AssignedCommitteeMember(v.id, mapped, v.finishReview));
          observer.complete();
        },
        error: e => {
          observer.error(e);
          observer.complete();
        }
      })
  });
}

/**
 * This class is used for mapping submitted application responses
 */
@MapApplicationResponse([ResponseMapperKeys.SUBMITTED, ResponseMapperKeys.RESUBMITTED])
export class SubmittedApplicationResponseMapper implements ApplicationResponseMapper {
  map(response: SubmittedApplicationResponse): Observable<Application> {
    const injector: InjectorService = InjectorService.getInstance();
    const userService: UserService = injector.inject(UserService);

    return new Observable<Application>(observer => {
      const answers: AnswersMapping = mapAnswers(response.answers);
      const attachedFiles: AttachedFilesMapping = mapAttachedFiles(response.attachedFiles);
      const comments: CommentsMapping = mapComments(response.comments);

      const finalComment = mapComment(response.finalComment);

      const observables: Observable<any>[] = [
        joinAndWait(response.assignedCommitteeMembers, (v: AssignedCommitteeMemberResponse[]) => v.map(v => assignedMemberObservableMapper(v, userService)))
      ];

      if (response.previousCommitteeMembers) {
        observables.push(joinAndWait(response.previousCommitteeMembers, (v: string[]) => v.map(v => userService.getUser(v))));
      }

      joinAndWait(observables).subscribe({
        next: usersArray => {
          loadUserAndTemplate(observer, response,
            value => {
              observer.next(Application.create(new SubmittedApplicationInitialiser(response.dbId, response.id, value.user, ApplicationStatus[response.status], value.template, answers, attachedFiles,
              new Date(response.lastUpdated), comments, usersArray[0], finalComment, (usersArray.length > 1) ? mapUsersArray(usersArray[1]) : [], new Date(response.approvalTime))))
              observer.complete();
            });
        },
        error: e => observer.next(e)
      })
    });
  }
}

/**
 * This class is used for mapping referred application responses 
 */
@MapApplicationResponse(ResponseMapperKeys.REFERRED)
export class ReferredApplicationResponseMapper implements ApplicationResponseMapper {
  map(response: ReferredApplicationResponse): Observable<Application> {
    const injector: InjectorService = InjectorService.getInstance();
    const userService: UserService = injector.inject(UserService);

    return new Observable<Application>(observer => {
      const answers: AnswersMapping = mapAnswers(response.answers);
      const attachedFiles: AttachedFilesMapping = mapAttachedFiles(response.attachedFiles);
      const comments: CommentsMapping = mapComments(response.comments);

      const finalComment = mapComment(response.finalComment);

      const observables: Observable<any>[] = [
        joinAndWait(response.assignedCommitteeMembers, (v: AssignedCommitteeMemberResponse[]) => v.map(v => assignedMemberObservableMapper(v, userService))),
        userService.getUser(response.referredBy)
      ];

      if (response.previousCommitteeMembers) {
        observables.push(joinAndWait(response.previousCommitteeMembers, (v: string[]) => v.map(v => userService.getUser(v))));
      }

      joinAndWait(observables).subscribe({
        next: usersArray => {
          loadUserAndTemplate(observer, response,
            value => {
              observer.next(Application.create(new ReferredApplicationInitialiser(response.dbId, response.id, value.user, ApplicationStatus[response.status], value.template, answers, attachedFiles,
                new Date(response.lastUpdated), comments, usersArray[0], finalComment, (usersArray.length > 2) ? mapUsersArray(usersArray[2]) : [], new Date(response.approvalTime),
                response.editableFields, userResponseMapper(usersArray[1]))));
              observer.complete();
            });
        },
        error: e => observer.next(e)
      })
    });
  }
}