const { test, expect } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage');
const ProductsPage = require('../page-objects/ProductsPage');
const CartPage = require('../page-objects/CartPage');
const CheckoutPage = require('../page-objects/CheckoutPage');
const testData = require('../utils/test-data');

test.describe('Standard User Complete Shopping Journey', () => {
  test('Should complete full shopping journey with standard_user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    // Step 1: Login
    console.log('Step 1: Logging in with standard_user...');
    await loginPage.goto();
    await loginPage.login(
      testData.users.standard.username, 
      testData.users.standard.password
    );
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    console.log('Successfully logged in with standard_user');
    
    await productsPage.waitForPageLoad();
    
    // Step 2: Reset App State
    console.log('Step 2: Resetting app state');
    await productsPage.resetAppState();
    console.log('App state reset completed');
    
    // Step 3: Add items to cart
    console.log('Step 3: Adding 3 random items to cart');
    const addedProducts = await productsPage.addRandomProductsToCart(3);
    expect(addedProducts).toHaveLength(3);
    console.log('Added 3 products to cart');
    
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(3);
    console.log('Cart badge shows 3 items');
    
    // Step 4: Go to cart
    console.log('Step 4: Navigating to cart');
    await productsPage.goToCart();
    await cartPage.waitForPageLoad();
    console.log('Navigated to cart page');
    
    // Step 5: Verify cart items
    console.log('Step 5: Verifying products in cart');
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(3);
    
    const cartVerified = await cartPage.verifyCartContains(addedProducts);
    expect(cartVerified).toBeTruthy();
    console.log('All products verified in cart');
    
    // Step 6: Proceed to checkout
    console.log('Step 6: Proceeding to checkout');
    await cartPage.proceedToCheckout();
    console.log('Navigated to checkout information page');
    
    // Step 7: Fill checkout info
    console.log('Step 7: Filling checkout information');
    await checkoutPage.completeInformationStep(testData.checkoutInfo);
    console.log('Checkout information filled');
    
    // Step 8: Verify overview
    console.log('Step 8: Verifying checkout overview');
    const overviewVerified = await checkoutPage.verifyOverviewProducts(addedProducts);
    expect(overviewVerified).toBeTruthy();
    console.log('Products in checkout overview verified');
    
    const totalCorrect = await checkoutPage.verifyTotalCalculation();
    expect(totalCorrect).toBeTruthy();
    console.log('Total price calculation verified');
    
    // Step 9: Finish purchase
    console.log('Step 9: Finishing purchase');
    await checkoutPage.finishPurchase();
    console.log('Purchase completed');
    
    // Step 10: Verify completion
    console.log('Step 10: Verifying success message');
    const orderCompleted = await checkoutPage.verifyOrderCompletion(
      testData.successMessages.orderComplete
    );
    expect(orderCompleted).toBeTruthy();
    console.log('Success message verified');
    
    // Step 11: Back to products
    console.log('Step 11: Returning to products page');
    await checkoutPage.backToProducts();
    await productsPage.waitForPageLoad();
    console.log('Returned to products page');
    
    // Step 12: Reset again
    console.log('Step 12: Resetting app state again...');
    await productsPage.resetAppState();
    console.log('App state reset completed');
    
    // Step 13: Logout
    console.log('Step 13: Logging out');
    await productsPage.logout();
    console.log('Successfully logged out');
    
    expect(page.url()).toMatch(/.*saucedemo\.com\/?$/);
    console.log('Returned to login page');
    
    console.log('Test Completed Successfully!');
  });
});