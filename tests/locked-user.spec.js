const { test, expect } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage');
const testData = require('../utils/test-data');

test.describe('Locked User Login Test', () => {
  
  test('Should display error message when trying to login with locked_out_user', async ({ page }) => {
    // Step 1: Initialize page object
    const loginPage = new LoginPage(page);
    
    // Step 2: Navigate to login page
    await loginPage.goto();
    console.log('Navigated to SauceDemo login page');
    
    // Step 3: Attempt login with locked user credentials
    await loginPage.login(
      testData.users.locked.username, 
      testData.users.locked.password
    );
    console.log('Attempted login with locked_out_user credentials');
    
    // Step 4: Verify that error message is displayed
    const isErrorDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isErrorDisplayed).toBeTruthy();
    console.log('Error message is displayed');
    
    // Step 5: Verify the specific error message text
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(testData.errorMessages.lockedUser);
    console.log('Error message text verified:', errorMessage);
    
    // Step 6: Verify that user is NOT logged in (still on login page)
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeFalsy();
    console.log('Confirmed user is not logged in');
    
    // Additional verification
    expect(page.url()).toMatch(/.*saucedemo\.com\/?$/);
    console.log('Still on login page URL confirmed');
    
    console.log('Test Completed Successfully!');
    console.log('Test Summary:');
    console.log('Attempted login with locked_out_user');
    console.log('Verified error message is displayed');
    console.log('Verified correct error message text');
    console.log('Confirmed user remains on login page');
  });
  
});