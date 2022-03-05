/**
 * This file holds a mapping of error/info messages from the server to human friendly messages
 */

/**
 * The mappings of the error messages
 */
export const ErrorMappings = {
    username_exists: 'The username already exists',
    email_exists: 'The e-mail already exists',
    user_exists: 'The user already exists',
    user_not_found: 'The user cannot be found',
    invalid_credentials: 'The entered credentials are invalid',
    account_not_confirmed: 'The account is not confirmed',
    illegal_update: 'The update failed, please try again',
    insufficient_permissions: 'You do not have enough permissions to carry out the attempted action',
    account_not_exists: 'The account does not exist',
    role_not_found: 'The role could not be found',
    file_error: 'An unexpected file error occurred, please try again',
    unsupported_file_type: 'The given file type is not supported',
    virus_found_file: 'The upload of the given file has been blocked since a virus was found in it',
    invalid_application_status: 'The status of the application is invalid for the attempted operation',
    application_already_exists: 'The application already exists',
    invalid_reset_token: 'The current password reset request token is invalid'
}

/**
 * The mappings of info messages
 */
export const MessageMappings = {
    account_updated: 'The account has been updated successfully',
    application_updated: 'The application has been updated successfully'
}