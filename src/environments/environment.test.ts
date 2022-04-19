export const environment = {
  production: true,
  requireULEmail: true, // require UL e-mail addresses on signup
  testing: true,
  default_template_id: 'expedited',
  login_redirect_token_expiry: 600000, // if / is navigated to and the authentication token is going to expire in X milliseconds, clear it and force re-login. This ensures token won't expire while filling in an application
  api_base: 'http://localhost:8080', // the URL and PORT of the backend API
  deleteApplicationOnTerminate: true, // if a terminate action is taken on a draft application and it is saved, this determines if it should be deleted from the server
  supportedFileTypes: '.pdf,.jpeg,.png', // supported types of files to upload
  contactEmail: 'johann.griffin@ul.ie', // email of committee member to contact
  contactName: 'Johanna Griffin', // name of committee member to contact
  forceSaveBeforeSubmit: true, // usually, the draft/referred application is only saved before submit if it has been modified. Set this to true, to force it to save regardless
  confirmManualAnswerOnce: true // when choosing to manually answer a question requiring input and then request input, set this to true to confirm only once, or false to confirm each time
};
