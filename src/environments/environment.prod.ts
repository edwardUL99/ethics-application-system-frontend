export const environment = {
  production: true,
  requireULEmail: true,
  testing: false,
  default_template_id: 'expedited',
  login_redirect_token_expiry: 600000, // if / is navigated to and the authentication token is going to expire in X milliseconds, clear it and force re-login. This ensures token won't expire while filling in an application
  api_base: 'https://ul-scieng-ethics-backend.herokuapp.com:8080',
  deleteApplicationOnTerminate: true, // if a terminate action is taken on a draft application and it is saved, this determines if it should be deleted from the server
  supportedFileTypes: '.pdf,.jpeg,.png', // supported types of files to upload
  contactEmail: 'johann.griffin@ul.ie', // email of committee member to contact,
  contactName: 'Johanna Griffin' // name of committee member to contact
};
