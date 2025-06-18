class CartPage {
  constructor(page) {
    this.page = page;
    
    // Selectors for cart page elements
    this.cartItems = '.cart_item';
    this.cartItemNames = '.inventory_item_name';
    this.cartItemPrices = '.inventory_item_price';
    this.checkoutButton = '[data-test="checkout"]';
    this.continueShoppingButton = '[data-test="continue-shopping"]';
    this.removeButtons = 'button[id^="remove"]';
    this.cartTitle = '.title';
  }

  //Wait for cart page to load
  async waitForPageLoad() {
    await this.page.waitForSelector(this.cartTitle);
    
    // Wait for any cart items to load if they exist
    await this.page.waitForTimeout(1000);
  }

  //Get all product names in the cart
  async getCartProductNames() {
    try {
      await this.page.waitForSelector(this.cartItemNames, { timeout: 5000 });
      return await this.page.$$eval(this.cartItemNames, elements => 
        elements.map(el => el.textContent.trim())
      );
    } catch (error) {
      return []; // No items in cart
    }
  }

  
   //Get all product prices in the cart
  async getCartProductPrices() {
    try {
      await this.page.waitForSelector(this.cartItemPrices, { timeout: 5000 });
      return await this.page.$$eval(this.cartItemPrices, elements => 
        elements.map(el => el.textContent.trim())
      );
    } catch (error) {
      return []; // No items in cart
    }
  }

   //Get cart items with both names and prices
   
  async getCartItems() {
    const names = await this.getCartProductNames();
    const prices = await this.getCartProductPrices();
    
    return names.map((name, index) => ({
      name: name,
      price: prices[index] || ''
    }));
  }

  
   //Get the count of items in cart
  async getCartItemCount() {
    try {
      const items = await this.page.$$(this.cartItems);
      return items.length;
    } catch (error) {
      return 0;
    }
  }

   //Calculate total price of items in cart (excluding tax)
   
  async calculateItemTotal() {
    const prices = await this.getCartProductPrices();
    let total = 0;
    
    for (const price of prices) {
      // Remove $ sign and convert to number
      const numericPrice = parseFloat(price.replace('$', ''));
      total += numericPrice;
    }
    
    return total;
  }
  
   //Proceed to checkout
  async proceedToCheckout() {
    await this.page.click(this.checkoutButton);
    
    // Wait for checkout page to load
    await this.page.waitForURL('**/checkout-step-one.html');
  }

  //Continue shopping (go back to products page)
  async continueShopping() {
    await this.page.click(this.continueShoppingButton);
    
    // Wait for products page to load
    await this.page.waitForURL('**/inventory.html');
  }
  
  //Remove a specific item from cart by index
  async removeItemByIndex(index) {
    const removeButtons = await this.page.$$(this.removeButtons);
    
    if (index >= 0 && index < removeButtons.length) {
      await removeButtons[index].click();
      
      // Wait for item to be removed
      await this.page.waitForTimeout(1000);
    }
  }

  
   // Remove all items from cart

  async removeAllItems() {
    let removeButtons = await this.page.$$(this.removeButtons);
    
    while (removeButtons.length > 0) {
      await removeButtons[0].click();
      await this.page.waitForTimeout(500);
      removeButtons = await this.page.$$(this.removeButtons);
    }
  }

   // Check if cart is empty
  async isCartEmpty() {
    const itemCount = await this.getCartItemCount();
    return itemCount === 0;
  }


//Verify cart contains specific product
  async verifyCartContains(expectedProducts) {
    const cartItems = await this.getCartItems();
    
    // Check if all expected products are in cart
    for (const expectedProduct of expectedProducts) {
      const found = cartItems.some(cartItem => 
        cartItem.name === expectedProduct.name && 
        cartItem.price === expectedProduct.price
      );
      
      if (!found) {
        console.log(`Product not found in cart: ${expectedProduct.name}`);
        return false;
      }
    }
    
    return true;
  }
}

module.exports = CartPage;