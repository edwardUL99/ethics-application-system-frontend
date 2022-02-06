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
import { ApplicationTemplateResponse } from '../applications/applicationremplateresponse';

export const USERNAME = "username";
export const EMAIL = "username@email.com";
export const TOKEN = "token";
export const EXPIRY = new Date().toISOString();
export const PASSWORD = 'testPassword';
export const CONFIRMATION_KEY = 'key';

export const AUTH_RESPONSE: AuthenticationResponse = {
    username: USERNAME,
    token: TOKEN,
    expiry: EXPIRY
};

export const DEPARTMENT = 'department';
export const NAME = 'name';

export function createUserResponse(): UserResponse {
    return {
        username: USERNAME,
        name: NAME,
        department: DEPARTMENT,
        email: EMAIL,
        role: {
            id: 1,
            name: 'User',
            description: 'default role',
            singleUser: false,
            permissions: [
            {
                id: 2,
                name: 'Permission',
                description: 'default permission'
            }
            ]
        }
    };
}

export const ACCOUNT = new Account(USERNAME, EMAIL, null, true);
export const ROLE = new Role(1, 'User', 'default role',
  [new Permission(2, 'Permission', 'default permission')], false);

export function createUser(): User {
    return new User(USERNAME, NAME, ACCOUNT, DEPARTMENT, ROLE);
}

export const TEMPLATE_ID = 'test';
export const TEMPLATE_NAME = 'test application';
export const TEMPLATE_DESCRIPTION = 'test description'
export const TEMPLATE_VERSION = '1.0';

export function createApplicationTemplate(): ApplicationTemplate {
    const template: ApplicationTemplate = new ApplicationTemplate(1, TEMPLATE_NAME, TEMPLATE_DESCRIPTION, TEMPLATE_VERSION, []);
    const section = new SectionComponent(2, 'section', 'component-id', 'description', [], true);

    section.components.push(new TextQuestionComponent(3, 'test question', 'component-id2', 'test description question', 'test name', true, true, 'text'));
    template.components.push(section);

    return template;
}

export function createApplicationTemplateResponse() {
    const template = createApplicationTemplate();

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