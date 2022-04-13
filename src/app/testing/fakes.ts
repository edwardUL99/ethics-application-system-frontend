/*
A file to create fake objects for testing
*/

import { AuthenticationResponse } from '../authentication/authenticationresponse';
import { UserResponse } from '../users/responses/userresponse';
import { Account } from '../authentication/account';
import { Role } from '../users/role';
import { Permission } from '../users/permission';
import { User } from '../users/user';
import { ApplicationTemplate } from '../applications/models/applicationtemplate';
import { SectionComponent } from '../applications/models/components/sectioncomponent';
import { TextQuestionComponent } from '../applications/models/components/textquestioncomponent';
import { ContainerComponent } from '../applications/models/components/containercomponent';
import { Application } from '../applications/models/applications/application';
import { DraftApplicationInitialiser, SubmittedApplicationInitialiser, ReferredApplicationInitialiser } from '../applications/models/applications/applicationinit';
import { ApplicationStatus } from '../applications/models/applications/applicationstatus';
import { ApplicationResponse, DraftApplicationResponse, ReferredApplicationResponse, SubmittedApplicationResponse } from '../applications/models/requests/applicationresponse';
import { AccountResponse } from '../authentication/accountresponse';
import { GetAuthorizationResponse } from '../users/responses/getauthorizationresponse';
import { PermissionResponse } from '../users/responses/permissionresponse';
import { RoleResponse } from '../users/responses/roleresponse';
import { AssignMembersResponse } from '../applications/models/requests/assignmembersresponse';
import { createTimestamp } from '../utils';

export const USERNAME = "username";
export const EMAIL = "username@email.com";
export const TOKEN = "token";
export const EXPIRY = new Date(Date.now() + (1000 * 60 * 60 * 24 * 14)).toISOString()
export const PASSWORD = 'testPassword';
export const CONFIRMATION_KEY = 'key';

export const AUTH_RESPONSE: AuthenticationResponse = {
    username: USERNAME,
    token: TOKEN,
    expiry: EXPIRY
};

export function createAccountResponse(): AccountResponse {
    return {
        username: USERNAME,
        email: EMAIL,
        confirmed: true
    }
}

export const DEPARTMENT = 'department';
export const NAME = 'name';

export const ROLE = new Role(1, 'Applicant', 'This role is the default role allocated to every new user. New committee members are upgraded from this role by the Chair', 'APPLICANT',
  [new Permission(1, 'Create Application', 'This permission allows a user to create and submit an application', 'CREATE_APPLICATION')], false, undefined);


export function createUserResponse(): UserResponse {
    const rolePermission = ROLE.permissions.values().next().value;

    return {
        username: USERNAME,
        name: NAME,
        department: DEPARTMENT,
        email: EMAIL,
        role: {
            id: 1,
            name: ROLE.name,
            description: ROLE.description,
            tag: ROLE.tag,
            singleUser: ROLE.singleUser,
            permissions: [
                {
                    id: rolePermission.id,
                    name: rolePermission.name,
                    description: rolePermission.description,
                    tag: rolePermission.tag
                }
            ],
            downgradeTo: ROLE.downgradeTo
        }
    };
}

export const ACCOUNT = new Account(USERNAME, EMAIL, undefined, true);

export function createUser(): User {
    return new User(USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE);
}

export const TEMPLATE_ID = 'test';
export const TEMPLATE_NAME = 'test application';
export const TEMPLATE_DESCRIPTION = 'test description'
export const TEMPLATE_VERSION = '1.0';

export function createApplicationTemplate(): ApplicationTemplate {
    const template: ApplicationTemplate = new ApplicationTemplate(1, TEMPLATE_ID, TEMPLATE_NAME, TEMPLATE_DESCRIPTION, TEMPLATE_VERSION, []);
    const section = new SectionComponent(2, 'section', 'component-id', 'description', [], true);

    section.components.push(new TextQuestionComponent(3, 'test question', 'component-id2', 'test description question', 'test name', true, true, 'text'));
    template.components.push(section);

    return template;
}

export function createApplicationTemplateWithContainer(): ApplicationTemplate {
    const template: ApplicationTemplate = new ApplicationTemplate(1, TEMPLATE_ID, TEMPLATE_NAME, TEMPLATE_DESCRIPTION, TEMPLATE_VERSION, []);
    const section = new SectionComponent(2, 'section', 'component-id', 'description', [], true);
    const container = new ContainerComponent(3, 'component-id2', 'test-container', []);
    const question = new TextQuestionComponent(4, 'test question', 'component-id3', 'test description question', 'test name', true, true, 'text');
    container.components.push(question);

    section.components.push(container);
    template.components.push(section);

    return template;
}

export function createApplicationTemplateResponse() {
    return {
        applications: {
            TEMPLATE_ID: {
                databaseId: 1,
                id: TEMPLATE_ID,
                name: TEMPLATE_NAME,
                description: TEMPLATE_DESCRIPTION,
                version: TEMPLATE_VERSION,
                components: [
                    {
                        databaseId: 2,
                        type: 'section',
                        title: 'section',
                        componentId: 'component-id',
                        description: 'description',
                        components: [
                            {
                                databaseId: 3,
                                type: 'text-question',
                                title: 'test question',
                                componentId: 'component-id2',
                                description: 'test description question',
                                name: 'test name',
                                required: true,
                                singleLine: true,
                                questionType: 'text'
                            }
                        ],
                        autoSave: true
                    }
                ]
            }
        }
    };
}

export function createApplicationTemplateShape() {
  return {
    databaseId: 1,
    id: TEMPLATE_ID,
    name: TEMPLATE_NAME,
    description: TEMPLATE_DESCRIPTION,
    version: TEMPLATE_VERSION,
    components: [
      {
        databaseId: 2,
        type: 'section',
        title: 'section',
        componentId: 'component-id',
        description: 'description',
        components: [
            {
                databaseId: 3,
                type: 'text-question',
                title: 'test question',
                componentId: 'component-id2',
                description: 'test description question',
                name: 'test name',
                required: true,
                singleLine: true,
                questionType: 'text'
            }
        ],
        autoSave: true
      }
    ]
  }
}

export const APPLICATION_ID: string = 'test-application-id';

export function createDraftApplication(): Application {
    return Application.create(new DraftApplicationInitialiser(1, APPLICATION_ID, createUser(), 
        createApplicationTemplate(), {}, [], new Date()));
}

export function createDraftApplicationResponse(): DraftApplicationResponse {
    const draft = createDraftApplication();

    return {
        dbId: draft.id,
        id: draft.applicationId,
        username: draft.user.username,
        status: ApplicationStatus.DRAFT,
        templateId: draft.applicationTemplate.databaseId,
        answers: {},
        attachedFiles: [],
        lastUpdated: createTimestamp(new Date())    
    };
}

export function createSubmittedApplication(status: ApplicationStatus): Application {
    return Application.create(new SubmittedApplicationInitialiser(2, APPLICATION_ID, createUser(), status, createApplicationTemplate(),
    {}, [], new Date(), {}, [], undefined, [], undefined, undefined));
}

export function createSubmittedApplicationResponse(status: ApplicationStatus): SubmittedApplicationResponse {
    const submitted = createSubmittedApplication(status);

    return {
        dbId: submitted.id,
        id: submitted.applicationId,
        username: submitted.user.username,
        status: status,
        templateId: submitted.applicationTemplate.databaseId,
        answers: {},
        attachedFiles: [],
        lastUpdated: createTimestamp(new Date()),
        comments: {},
        assignedCommitteeMembers: [],
        submittedTime: undefined,
        finalComment: undefined,
        previousCommitteeMembers: undefined,
        approvalTime: undefined
    };
}

export function createReferredApplication(): Application {
    return Application.create(new ReferredApplicationInitialiser(3, APPLICATION_ID, createUser(), ApplicationStatus.REFERRED,
        createApplicationTemplate(), {}, [], new Date(), {}, [], undefined, [], undefined, undefined, [], undefined));
}

export function createReferredApplicationResponse(): ReferredApplicationResponse {
    const referred = createReferredApplication();

    return {
        dbId: referred.id,
        id: referred.applicationId,
        username: referred.user.username,
        status: ApplicationStatus.REFERRED,
        templateId: referred.applicationTemplate.databaseId,
        answers: {},
        attachedFiles: [],
        lastUpdated: createTimestamp(new Date()),
        comments: {},
        assignedCommitteeMembers: [],
        finalComment: undefined,
        previousCommitteeMembers: undefined,
        submittedTime: undefined,
        approvalTime: undefined,
        editableFields: [],
        referredBy: undefined
    };
}

export function createPermissionsResponse(): GetAuthorizationResponse<PermissionResponse> {
    return {
        authorizations: [
            {
                id: 1,
                name: 'Create Application',
                description: 'This permission allows a user to create and submit an application',
                tag: 'CREATE_APPLICATION'
            }
        ]
    };
}

export function createRolesResponse(): GetAuthorizationResponse<RoleResponse> {
    return {
        authorizations: [
            {
                id: 2,
                name: 'Applicant',
                description: 'This role is the default role allocated to every new user. New committee members are upgraded from this role by the Chair',
                tag: 'APPLICANT',
                permissions: [
                    createPermissionsResponse().authorizations[0]
                ],
                singleUser: false,
                downgradeTo: undefined
            }
        ]
    };
}

export function createAssignMembersResponse(): AssignMembersResponse {
    return {
        id: APPLICATION_ID,
        members: [
            {
                id: 1,
                applicationId: APPLICATION_ID,
                member: {
                    username: USERNAME,
                    email: EMAIL,
                    department: DEPARTMENT,
                    name: NAME,
                    role: ROLE.name
                },
                finishReview: false
            }
        ],
        lastUpdated: createTimestamp(new Date())
    };
}

export function createListApplicationsResponse(): ApplicationResponse[] {
    let response1 = createDraftApplicationResponse();
    let response2 = createDraftApplicationResponse();
    response2.id = APPLICATION_ID + '-2';

    return [response1, response2];
}