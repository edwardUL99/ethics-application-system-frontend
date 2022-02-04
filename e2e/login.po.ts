import { browser, by, element } from 'protractor';

export class LoginPage {
    navigateTo() {
        return browser.get('login');
    }

    getHeaderText() {
        return element(by.css('app-root h3')).getText();
    }

    getUsername() {
        return element(by.name('username'));
    }

    getPassword() {
        return element(by.name('password'));
    }

    getLogin() {
        return element(by.buttonText('Login'));
    }

    getError() {
        return element(by.css('.alert-danger'));
    }
}