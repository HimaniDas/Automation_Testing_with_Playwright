class ProductsPage {
  constructor(page) {
    this.page = page;
    // Selectors
    this.hamburgerMenu = '#react-burger-menu-btn';
    this.resetAppStateLink = '#reset_sidebar_link';
    this.logoutLink = '#logout_sidebar_link';
    this.closeMenuButton = '#react-burger-cross-btn';
    this.sortDropdown = '[data-test="product-sort-container"]';
    this.inventoryItems = '.inventory_item';
    this.inventoryItemNames = '.inventory_item_name';
    this.addToCartButtons = 'button[id^="add-to-cart"]';
    this.cartBadge = '.shopping_cart_badge';
    this.cartLink = '.shopping_cart_link';
    this.productPrices = '.inventory_item_price';
    this.loadingSpinner = '[data-test="loading-spinner"]';
    this.errorContainer = '[data-test="error"]';
  }
  async waitForPageLoad() {
      console.log('Waiting for products page to load');
      await this.page.waitForURL('**/inventory.html', { 
      timeout: 60000,
      waitUntil: 'domcontentloaded'
   });
      await this.page.waitForSelector(this.inventoryItems, {
      state: 'visible',
      timeout: 45000
   });
    console.log('Products page fully loaded');
  }

 async sortProducts(sortOption) {
    console.log(`Attempting to sort products by ${sortOption}`);
    try {
        await this.waitForPageLoad();
        
        // Wait for dropdown with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let sortedSuccessfully = false;
        
        while (attempts < maxAttempts && !sortedSuccessfully) {
            try {
                console.log(`Sort attempt ${attempts + 1}`);
                
                // Wait for dropdown to be ready
                await this.page.waitForSelector(this.sortDropdown, {
                    state: 'attached',
                    timeout: 30000
                });
                
                // check for interactability
                await this.page.waitForFunction((selector) => {
                    const select = document.querySelector(selector);
                    return select && select.offsetWidth > 0 && !select.disabled;
                }, this.sortDropdown, { timeout: 30000 });
                
                // Perform the sort
                await this.page.selectOption(this.sortDropdown, sortOption);
                
                // Wait for UI to update
                await this.page.waitForTimeout(2000);
                
                // Verify the sort took effect
                const currentProducts = await this.getProductNames();
                if (currentProducts.length > 0) {
                    sortedSuccessfully = true;
                    console.log(`Successfully sorted products ${sortOption.toUpperCase()}`);
                    return currentProducts;
                }
                
             } 
            catch (error) {
                console.log(`Attempt ${attempts + 1} failed:`, error.message);
                await this.page.screenshot({ path: `sort-failure-attempt-${attempts + 1}.png` });
                attempts++;
                if (attempts < maxAttempts) {
                    await this.page.waitForTimeout(3000); // Wait before retry
                }
            }
        }
        
        if (!sortedSuccessfully) {
            throw new Error(`Failed to sort products after ${maxAttempts} attempts`);
        }
     }
    catch (error) {
        console.error('Sorting completely failed:', error);
        await this.page.screenshot({ path: 'sorting-complete-failure.png' });
        throw error;
    }
}

  async openHamburgerMenu() {
    await this.page.waitForSelector(this.hamburgerMenu, { timeout: 30000 });
    await this.page.click(this.hamburgerMenu);
    await this.page.waitForSelector(this.resetAppStateLink, { 
      state: 'visible',
      timeout: 30000 
    });
  }

  async resetAppState() {
    await this.openHamburgerMenu();
    await this.page.click(this.resetAppStateLink);
    await this.page.click(this.closeMenuButton);
    await this.page.waitForTimeout(3000);
  }

  async logout() {
    await this.openHamburgerMenu();
    await this.page.click(this.logoutLink);
    await this.page.waitForURL('**/');
  }

  async sortProducts(sortOption) {
    console.log('Sorting products by:', sortOption);
    await this.page.waitForSelector(this.sortDropdown, { 
      state: 'visible', 
      timeout: 60000 
    });
    await this.page.waitForTimeout(3000);
    await this.page.selectOption(this.sortDropdown, sortOption);
    await this.page.waitForTimeout(6000);
  }

  async getProductNames() {
    await this.page.waitForSelector(this.inventoryItemNames, { timeout: 30000 });
    return await this.page.$$eval(this.inventoryItemNames, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  async getProductPrices() {
    await this.page.waitForSelector(this.productPrices, { timeout: 30000 });
    return await this.page.$$eval(this.productPrices, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  async addRandomProductsToCart(count = 3) {
    const productNames = await this.getProductNames();
    const productPrices = await this.getProductPrices();
    const addButtons = await this.page.$$(this.addToCartButtons);
    
    const selectedProducts = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < Math.min(count, addButtons.length); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * addButtons.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      await addButtons[randomIndex].click();
      
      selectedProducts.push({
        name: productNames[randomIndex],
        price: productPrices[randomIndex]
      });
      
      await this.page.waitForTimeout(1000);
    }
    
    return selectedProducts;
  }

  async addFirstProductToCart() {
    const productNames = await this.getProductNames();
    const productPrices = await this.getProductPrices();
    const addButtons = await this.page.$$(this.addToCartButtons);
    await addButtons[0].click();
    await this.page.waitForTimeout(2000);
    return {
      name: productNames[0],
      price: productPrices[0]
    };
  }

  async getCartItemCount() {
    try {
      await this.page.waitForSelector(this.cartBadge, { timeout: 5000 });
      const badgeText = await this.page.textContent(this.cartBadge);
      return parseInt(badgeText) || 0;
    } catch (error) {
      return 0;
    }
  }

  async goToCart() {
    await this.page.waitForSelector(this.cartLink, { timeout: 30000 });
    await this.page.click(this.cartLink);
    await this.page.waitForURL('**/cart.html', { timeout: 30000 });
  }

  async isOnProductsPage() {
    try {
      await this.page.waitForURL('**/inventory.html', { timeout: 10000 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ProductsPage;