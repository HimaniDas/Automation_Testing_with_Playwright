class CheckoutPage {
  constructor(page) {
    this.page = page;
    
    // Selectors for checkout step one (information)
    this.firstNameInput = '[data-test="firstName"]';
    this.lastNameInput = '[data-test="lastName"]';
    this.postalCodeInput = '[data-test="postalCode"]';
    this.continueButton = '[data-test="continue"]';
    this.cancelButton = '[data-test="cancel"]';
    this.errorMessage = '[data-test="error"]';
    
    // Selectors for checkout step two (overview)
    this.itemNames = '.inventory_item_name';
    this.itemPrices = '.inventory_item_price';
    this.itemTotal = '.summary_subtotal_label';
    this.tax = '.summary_tax_label';
    this.totalPrice = '.summary_total_label';
    this.finishButton = '[data-test="finish"]';
    this.cancelButtonOverview = '[data-test="cancel"]';
    
    // Selectors for checkout complete
    this.completeHeader = '.complete-header';
    this.completeText = '.complete-text';
    this.backHomeButton = '[data-test="back-to-products"]';
  }

  
  //Fill checkout information form
  async fillCheckoutInformation(info) {
  // Wait for the form to be visible
  await this.page.waitForSelector(this.firstNameInput);
  await this.page.fill(this.firstNameInput, info.firstName);
  await this.page.fill(this.lastNameInput, info.lastName);
  await this.page.fill(this.postalCodeInput, info.postalCode);
  }

  //Continue to checkout overview
  async continueToOverview() {
    await this.page.click(this.continueButton);
    
    // Wait for overview page to load
    await this.page.waitForURL('**/checkout-step-two.html');
    await this.page.waitForSelector(this.finishButton);
  }

  //Complete the checkout information step
  async completeInformationStep(info) {
    await this.fillCheckoutInformation(info);
    await this.continueToOverview();
  }

   //Get product names from checkout overview
  async getOverviewProductNames() {
    await this.page.waitForSelector(this.itemNames);
    return await this.page.$$eval(this.itemNames, elements => 
      elements.map(el => el.textContent.trim())
    );
  }
 //Get product prices from checkout overview
  async getOverviewProductPrices() {
    await this.page.waitForSelector(this.itemPrices);
    return await this.page.$$eval(this.itemPrices, elements => 
    elements.map(el => el.textContent.trim())
    );
  }
   // Get overview items with names and prices
  async getOverviewItems() {
    const names = await this.getOverviewProductNames();
    const prices = await this.getOverviewProductPrices();
    
    return names.map((name, index) => ({
      name: name,
      price: prices[index] || ''
    }));
  }
   // Get the item total (before tax)
  async getItemTotal() {
    await this.page.waitForSelector(this.itemTotal);
    return await this.page.textContent(this.itemTotal);
  }
   // Get the tax amount
  async getTax() {
    await this.page.waitForSelector(this.tax);
    return await this.page.textContent(this.tax);
  }
 
  //Get the total price (including tax)
  async getTotalPrice() {
    await this.page.waitForSelector(this.totalPrice);
    return await this.page.textContent(this.totalPrice);
  }

  //Get all pricing information from overview
  async getPricingInfo() {
    return {
      itemTotal: await this.getItemTotal(),
      tax: await this.getTax(),
      totalPrice: await this.getTotalPrice()
    };
  }

  // Extract numeric value from price text
  extractPrice(priceText) {
    const match = priceText.match(/\$(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  //Verify that the calculated total matches the displayed total
  async verifyTotalCalculation() {
    const pricingInfo = await this.getPricingInfo();
    
    const itemTotal = this.extractPrice(pricingInfo.itemTotal);
    const tax = this.extractPrice(pricingInfo.tax);
    const expectedTotal = itemTotal + tax;
    const displayedTotal = this.extractPrice(pricingInfo.totalPrice);
    
    // Allow for small floating point differences
    return Math.abs(expectedTotal - displayedTotal) < 0.01;
  }

  // Finish the purchase
  async finishPurchase() {
    await this.page.click(this.finishButton);
    
    // Wait for completion page to load
    await this.page.waitForURL('**/checkout-complete.html');
    await this.page.waitForSelector(this.completeHeader);
  }

  //Get the completion message header
  async getCompletionHeader() {
    await this.page.waitForSelector(this.completeHeader);
    return await this.page.textContent(this.completeHeader);
  }

  //Get the completion message text
  async getCompletionText() {
    await this.page.waitForSelector(this.completeText);
    return await this.page.textContent(this.completeText);
  }

  //Verify successful order completion
  async verifyOrderCompletion(expectedHeader = 'Thank you for your order!') {
    try {
      const header = await this.getCompletionHeader();
      return header.includes(expectedHeader);
    } catch (error) {
      return false;
    }
  }

  //Go back to products page from completion page
  async backToProducts() {
    await this.page.click(this.backHomeButton);
    
    // Wait for products page to load
    await this.page.waitForURL('**/inventory.html');
  }

  //Cancel checkout and return to cart
  async cancelCheckout() {
    // Check which cancel button to use based on current page
    const currentUrl = this.page.url();
    
    if (currentUrl.includes('checkout-step-one')) {
      await this.page.click(this.cancelButton);
    } else if (currentUrl.includes('checkout-step-two')) {
      await this.page.click(this.cancelButtonOverview);
    }
    
    // Wait for cart page to load
    await this.page.waitForURL('**/cart.html');
  }

  //Verify products in checkout overview match expected products
  async verifyOverviewProducts(expectedProducts) {
    const overviewItems = await this.getOverviewItems();
    
    if (overviewItems.length !== expectedProducts.length) {
      console.log(`Product count mismatch. Expected: ${expectedProducts.length}, Found: ${overviewItems.length}`);
      return false;
    }

    // Check if all expected products are in overview
    for (const expectedProduct of expectedProducts) {
      const found = overviewItems.some(item => 
        item.name === expectedProduct.name && 
        item.price === expectedProduct.price
      );
      
      if (!found) {
        console.log(`Product not found in overview: ${expectedProduct.name}`);
        return false;
      }
    }
    
    return true;
  }

  //Complete entire checkout process

  async completeCheckoutProcess(checkoutInfo, expectedProducts = []) {
    try {
      // Step 1: Fill information
      await this.completeInformationStep(checkoutInfo);
      
      // Step 2: Verify products in overview (if provided)
      if (expectedProducts.length > 0) {
        const productsMatch = await this.verifyOverviewProducts(expectedProducts);
        if (!productsMatch) {
          console.log('Products verification failed in checkout overview');
          return false;
        }
      }
      
      // Step 3: Verify total calculation
      const totalCorrect = await this.verifyTotalCalculation();
      if (!totalCorrect) {
        console.log('Total calculation verification failed');
        return false;
      }
      
      // Step 4: Finish purchase
      await this.finishPurchase();
      
      // Step 5: Verify completion
      return await this.verifyOrderCompletion();
      
    } catch (error) {
      console.log('Error during checkout process:', error.message);
      return false;
    }
  }
   //Get error message from checkout form
   
  async getErrorMessage() {
    try {
      await this.page.waitForSelector(this.errorMessage, { timeout: 3000 });
      return await this.page.textContent(this.errorMessage);
    } catch (error) {
      return null;
    }
  }
}

module.exports = CheckoutPage;