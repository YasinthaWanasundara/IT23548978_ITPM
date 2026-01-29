const { test, expect } = require('@playwright/test');
const positiveCases = require('../test-data/positive-cases.json');

test.describe('Positive Functional Tests - Singlish to Sinhala', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('Navigating to Swift Translator...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for page to be fully loaded
    await page.waitForTimeout(1000);
  });

  // Loop through all positive test cases
  for (const testCase of positiveCases) {
    test(`Positive Test ${testCase.id}: ${testCase.name}`, async ({ page }) => {
      console.log(`\n=== Testing: ${testCase.id} ===`);
      console.log(`Input: ${testCase.input}`);
      console.log(`Expected: ${testCase.expected}`);
      
      try {
        // Try different selectors for input field
        let inputField;
        const possibleInputSelectors = [
          'input[type="text"]',
          'textarea',
          '#input',
          '.input-field',
          '[placeholder*="Singlish"]',
          'input'
        ];
        
        for (const selector of possibleInputSelectors) {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            inputField = element;
            console.log(`Found input field with selector: ${selector}`);
            break;
          }
        }
        
        if (!inputField) {
          throw new Error('Input field not found. Check website structure.');
        }
        
        // Clear and type input
        await inputField.clear();
        await inputField.fill(testCase.input);
        await page.waitForTimeout(500);
        
        // Try different selectors for output field
        let outputField;
        const possibleOutputSelectors = [
          'textarea:disabled',
          '.output',
          '#output',
          '.result',
          '.transliterated-text',
          'pre'
        ];
        
        for (const selector of possibleOutputSelectors) {
          const element = page.locator(selector).first();
          if (await element.count() > 0) {
            outputField = element;
            console.log(`Found output field with selector: ${selector}`);
            break;
          }
        }
        
        if (!outputField) {
          throw new Error('Output field not found. Check website structure.');
        }
        
        // Get actual output
        let actualOutput = '';
        
        // Try different methods to get text
        try {
          actualOutput = await outputField.textContent();
        } catch (e) {
          try {
            actualOutput = await outputField.inputValue();
          } catch (e2) {
            actualOutput = await outputField.innerText();
          }
        }
        
        actualOutput = actualOutput.trim();
        console.log(`Actual Output: ${actualOutput}`);
        
        // Take screenshot for documentation
        await page.screenshot({ 
          path: `screenshots/${testCase.id}_${Date.now()}.png`,
          fullPage: false 
        });
        
        // Assertion
        expect(actualOutput).toBe(testCase.expected);
        
        console.log(`✓ Test ${testCase.id} PASSED`);
        
      } catch (error) {
        console.error(`✗ Test ${testCase.id} FAILED: ${error.message}`);
        
        // Take screenshot on failure
        await page.screenshot({ 
          path: `screenshots/${testCase.id}_FAILED_${Date.now()}.png`,
          fullPage: true 
        });
        
        throw error;
      }
    });
  }
});