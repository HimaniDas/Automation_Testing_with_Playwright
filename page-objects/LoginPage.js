class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = '[data-test="username"]';
    this.passwordInput = '[data-test="password"]';
    this.loginButton = '[data-test="login-button"]';
    this.errorMessage = '[data-test="error"]';
    this.errorButton = '.error-button';
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForSelector(this.usernameInput);
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, '');
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, '');
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForTimeout(1000);
  }

  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.page.textContent(this.errorMessage);
    } catch (error) {
      return null;
    }
  }

  async isErrorMessageDisplayed() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
      return await this.page.isVisible(this.errorMessage);
    } catch (error) {
      return false;
    }
  }

  async isLoggedIn() {
    try {
      await this.page.waitForURL('**/inventory.html', { timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  async clearErrorMessage() {
    try {
      if (await this.page.isVisible(this.errorButton)) {
        await this.page.click(this.errorButton);
      }
    } catch (error) {
    
    }
  }
}

module.exports = LoginPage;