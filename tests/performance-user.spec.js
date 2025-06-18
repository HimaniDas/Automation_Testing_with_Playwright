const { test, expect } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage');
const ProductsPage = require('../page-objects/ProductsPage');
const CartPage = require('../page-objects/CartPage');
const CheckoutPage = require('../page-objects/CheckoutPage');
const testData = require('../utils/test-data');

test.describe('Performance User with Product Filtering', () => {
  test('Should complete shopping journey with performance_glitch_user and Z-A filtering', async ({ page }) => {
    // Extended timeout for performance user
    test.setTimeout(300000); 
    
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    
    // Step 1: Login with retry logic
    console.log('Step 1: Logging in with performance_glitch_user');
    let loggedIn = false;
    let loginAttempts = 0;
    
    while (!loggedIn && loginAttempts < 3) {
      try {
        await loginPage.goto();
        await loginPage.login(
          testData.users.performance.username,
          testData.users.performance.password
        );
        loggedIn = await loginPage.isLoggedIn();
      } 
      catch (error) {
        console.log(`Login attempt ${loginAttempts + 1} failed, retrying`);
        await page.waitForTimeout(3000);
      }
      loginAttempts++;
    }
    
    expect(loggedIn).toBeTruthy();
    console.log('Successfully logged in after', loginAttempts, 'attempts');
    
    // Step 2: Wait for products page
    console.log('Waiting for products page to load...');
    await productsPage.waitForPageLoad();
    console.log('Products page loaded (with performance delay)');
    
    // Step 3: Reset app state
    console.log('Step 2: Resetting app state...');
    await productsPage.resetAppState();
    console.log('App state reset completed');
    
    // Step 4: Verify Z-A sorting
    console.log('Step 3: Verifying Z-A sorting...');
    const originalProducts = await productsPage.getProductNames();
    const originalLastProduct = originalProducts[originalProducts.length - 1];
    console.log('Original last product:', originalLastProduct);

    // Perform Z-A sort
    await productsPage.sortProducts('za');
    const sortedProducts = await productsPage.getProductNames();
    console.log('Products after Z-A sort:', sortedProducts);

    // Verify the last product is now first
    expect(sortedProducts[0]).toBe(originalLastProduct);
    console.log('Verified last product is now first after Z-A sort');

    // Take screenshot for proof
    await page.screenshot({ path: 'za-sorting-result.png' });
    
    // Step 5: Add first product to cart
    console.log('Step 4: Adding first product to cart');
    const addedProduct = await productsPage.addFirstProductToCart();
    console.log(`Added product: ${addedProduct.name} - ${addedProduct.price}`);
    
    // Step 6: Verify cart count with retries
    let cartCount = 0;
    let cartRetries = 0;
    const maxCartRetries = 5;
    
    while (cartCount !== 1 && cartRetries < maxCartRetries) {
      await page.waitForTimeout(2000);
      cartCount = await productsPage.getCartItemCount();
      cartRetries++;
      console.log(`Cart check attempt ${cartRetries}: ${cartCount}`);
    }
    
    expect(cartCount).toBe(1);
    console.log('Cart badge shows 1 item');
    
    // Step 7: Go to cart
    console.log('Step 5: Navigating to cart');
    await productsPage.goToCart();
    await cartPage.waitForPageLoad();
    console.log('Navigated to cart page');
    
    // Step 8: Verify cart item
    console.log('Step 6: Verifying product in cart');
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].name).toBe(addedProduct.name);
    expect(cartItems[0].price).toBe(addedProduct.price);
    console.log('Product verified in cart');
    
    // Step 9: Proceed to checkout
    console.log('Step 7: Proceeding to checkout');
    await cartPage.proceedToCheckout();
    console.log('Navigated to checkout information page');
    
    // Step 10: Fill checkout information
    console.log('Step 8: Filling checkout information');
    await checkoutPage.completeInformationStep(testData.checkoutInfo);
    console.log('Checkout information filled');
    
    // Step 11: Verify overview
    console.log('Step 9: Verifying checkout overview');
    const overviewItems = await checkoutPage.getOverviewItems();
    expect(overviewItems).toHaveLength(1);
    expect(overviewItems[0].name).toBe(addedProduct.name);
    expect(overviewItems[0].price).toBe(addedProduct.price);
    console.log('Product in checkout overview verified');
    
    // Step 12: Finish purchase
    console.log('Step 10: Finishing purchase');
    await checkoutPage.finishPurchase();
    console.log('Purchase completed');
    
    // Step 13: Verify completion
    console.log('Step 11: Verifying success message');
    const orderCompleted = await checkoutPage.verifyOrderCompletion(
      testData.successMessages.orderComplete
    );
    expect(orderCompleted).toBeTruthy();
    console.log('Success message verified');
    
    // Step 14: Back to products
    console.log('Step 12: Returning to products page');
    await checkoutPage.backToProducts();
    await productsPage.waitForPageLoad();
    console.log('Returned to products page');
    
    // Step 15: Reset again
    console.log('Step 13: Resetting app state again');
    await productsPage.resetAppState();
    console.log('App state reset completed');
    
    // Step 16: Logout
    console.log('Step 14: Logging out');
    await productsPage.logout();
    console.log('Successfully logged out');
    
    expect(page.url()).toMatch(/.*saucedemo\.com\/?$/);
    console.log('Returned to login page');
    
    console.log('Test Completed Successfully!');
  });
});