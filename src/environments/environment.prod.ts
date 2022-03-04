export const environment = {
  production: true,
  requireULEmail: true,
  testing: false,
  default_template_id: 'expedited',
  login_redirect_token_expiry: 600000, // if / is navigated to and the authentication token is going to expire in X milliseconds, clear it and force re-login. This ensures token won't expire while filling in an application
  api_base: 'https://ul-scieng-ethics-backend.herokuapp.com'
};
