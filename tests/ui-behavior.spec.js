const { test, expect } = require('@playwright/test');

test.describe('UI Behavior Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Pos_UI_0001 - Real-time output update while typing', async ({ page }) => {
    console.log('Testing real-time output update...');
    
    // Find input field
    const inputField = page.locator('input[type="text"], textarea').first();
    const outputField = page.locator('textarea:disabled, .output, #output').first();
    
    // Clear input
    await inputField.clear();
    await page.waitForTimeout(300);
    
    const testPhrase = 'mama gedhara yanavaa';
    const expectedOutput = 'මම ගෙදර යනවා';
    
    // Type character by character
    for (let i = 0; i < testPhrase.length; i++) {
      const char = testPhrase[i];
      await inputField.type(char, { delay: 100 });
      
      // Small delay to allow conversion
      await page.waitForTimeout(50);
      
      // Get current output
      const currentOutput = await outputField.textContent();
      console.log(`Typed "${char}" -> Output: "${currentOutput}"`);
    }
    
    // Final output check
    const finalOutput = await outputField.textContent();
    console.log(`Final Output: "${finalOutput}"`);
    console.log(`Expected: "${expectedOutput}"`);
    
    expect(finalOutput.trim()).toBe(expectedOutput);
    
    // Verify UI responsiveness
    const startTime = Date.now();
    await inputField.type(' extra', { delay: 50 });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`UI Response Time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    
    await page.screenshot({ 
      path: 'screenshots/UI_RealTime_Update.png',
      fullPage: false 
    });
  });

  test('Neg_UI_0001 - Clear functionality (if available)', async ({ page }) => {
    console.log('Testing clear functionality...');
    
    const inputField = page.locator('input[type="text"], textarea').first();
    const outputField = page.locator('textarea:disabled, .output, #output').first();
    
    // Enter some text
    await inputField.fill('mama gedhara yanavaa');
    await page.waitForTimeout(500);
    
    const outputBeforeClear = await outputField.textContent();
    console.log(`Output before clear: "${outputBeforeClear}"`);
    
    // Look for clear button
    const clearButtonSelectors = [
      'button:has-text("Clear")',
      'button:has-text("Clear All")',
      '[aria-label="Clear"]',
      '.clear-button',
      '#clear-btn'
    ];
    
    let clearButton = null;
    for (const selector of clearButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.count() > 0) {
        clearButton = button;
        console.log(`Found clear button with selector: ${selector}`);
        break;
      }
    }
    
    if (clearButton) {
      // Click clear button
      await clearButton.click();
      await page.waitForTimeout(300);
      
      // Verify both fields are cleared
      const inputValue = await inputField.inputValue();
      const outputValue = await outputField.textContent();
      
      console.log(`Input after clear: "${inputValue}"`);
      console.log(`Output after clear: "${outputValue}"`);
      
      expect(inputValue).toBe('');
      expect(outputValue.trim()).toBe('');
      
      await page.screenshot({ 
        path: 'screenshots/UI_Clear_Functionality.png',
        fullPage: false 
      });
      
    } else {
      console.log('Clear button not found. Testing manual clear...');
      
      // Manual clear using keyboard
      await inputField.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      
      const inputValue = await inputField.inputValue();
      console.log(`Input after manual clear: "${inputValue}"`);
      
      // For manual clear, output might not clear automatically
      // This depends on the application behavior
    }
  });

  test('Pos_UI_0002 - Input field focus and cursor behavior', async ({ page }) => {
    console.log('Testing input field focus...');
    
    const inputField = page.locator('input[type="text"], textarea').first();
    
    // Click on input field
    await inputField.click();
    await page.waitForTimeout(300);
    
    // Check if input field has focus
    const isFocused = await inputField.evaluate(el => el === document.activeElement);
    console.log(`Input field focused: ${isFocused}`);
    
    expect(isFocused).toBe(true);
    
    // Test typing while focused
    await inputField.type('test', { delay: 100 });
    const inputValue = await inputField.inputValue();
    console.log(`Input value after typing: "${inputValue}"`);
    
    expect(inputValue).toContain('test');
    
    await page.screenshot({ 
      path: 'screenshots/UI_Input_Focus.png',
      fullPage: false 
    });
  });
});