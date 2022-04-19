// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  requireULEmail: true, // require UL e-mail addresses on signup
  testing: false,
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
