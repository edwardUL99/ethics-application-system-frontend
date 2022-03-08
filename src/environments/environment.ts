// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  requireULEmail: false,
  testing: false,
  default_template_id: 'expedited',
  login_redirect_token_expiry: 600000, // if / is navigated to and the authentication token is going to expire in X milliseconds, clear it and force re-login. This ensures token won't expire while filling in an application
  api_base: 'http://localhost:8080',
  deleteApplicationOnTerminate: true // if a terminate action is taken on a draft application and it is saved, this determines if it should be deleted from the server
};
