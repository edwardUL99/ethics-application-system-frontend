import { browser } from 'protractor'
import { ErrorMappings } from '../src/app/mappings';
import { LoginPage } from './login.po';

describe('login page', () => {
    let loginPage: LoginPage;

    beforeEach(() => {
        loginPage = new LoginPage();
    })

    it('should go to login', () => {
        browser.get('login');

        const username = loginPage.getUsername();
        const password = loginPage.getPassword();

        username.sendKeys('eddylynch9');
        password.sendKeys('testPassword2');

        expect(username.getAttribute('value')).toEqual('eddylynch9');
        expect(password.getAttribute('value')).toEqual('testPassword2');

        loginPage.getLogin().click();

        expect(loginPage.getError().getText()).toContain(ErrorMappings.account_not_exists);
    });
})