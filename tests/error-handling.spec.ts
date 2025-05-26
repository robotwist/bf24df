import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('http://localhost:3003');
    
    // Wait for the graph data to load
    await page.waitForSelector('[data-testid="stats"]', { state: 'visible', timeout: 30000 });
    
    // Open mapping editor
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error for save operation
    await page.route('**/api/mappings', route => route.abort('failed'));
    
    // Try to save a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Verify error message is shown
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to save mapping');
  });

  test('should handle validation errors', async ({ page }) => {
    // Try to map incompatible fields
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 2 }); // Different type

    // Verify validation error is shown
    const errorMessage = await page.locator('[data-testid="validation-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Incompatible field types');
  });

  test('should handle transformation errors', async ({ page }) => {
    // Create a mapping with transformation
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Select invalid transformation
    await page.selectOption('[data-testid="transformation-select"]', 'formatDate');
    await page.fill('[data-testid="transformation-format"]', 'invalid-format');

    // Verify transformation error is shown
    const errorMessage = await page.locator('[data-testid="transformation-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid date format');
  });

  test('should handle concurrent operation errors', async ({ page }) => {
    // Start creating a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Try to save multiple times quickly
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="save-button"]');

    // Verify error message about concurrent operations
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Operation in progress');
  });

  test('should handle state corruption gracefully', async ({ page }) => {
    // Create a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('mappings', 'invalid-json');
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="stats"]', { state: 'visible', timeout: 30000 });
    
    // Open mapping editor
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');

    // Verify error message about corrupted state
    const errorMessage = await page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid state');
  });
}); 