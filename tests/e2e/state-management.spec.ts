import { test, expect } from '@playwright/test';

test.describe('State Management', () => {
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

  test('should support undo/redo operations', async ({ page }) => {
    // Create initial mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Verify initial mapping exists
    const initialMapping = await page.locator('[data-testid="mapping-item"]');
    await expect(initialMapping).toBeVisible();

    // Remove mapping
    await page.click('[data-testid="remove-mapping"]');
    await expect(initialMapping).not.toBeVisible();

    // Undo removal
    await page.click('[data-testid="undo-button"]');
    await expect(initialMapping).toBeVisible();

    // Redo removal
    await page.click('[data-testid="redo-button"]');
    await expect(initialMapping).not.toBeVisible();
  });

  test('should persist state between sessions', async ({ page }) => {
    // Create a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Verify mapping was saved
    await expect(page.locator('[data-testid="mapping-status"]')).toContainText('Mapping saved');

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="stats"]', { state: 'visible', timeout: 30000 });
    
    // Open mapping editor again
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');

    // Verify mapping still exists
    const mappingItem = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItem).toBeVisible();
  });

  test('should show loading states during operations', async ({ page }) => {
    // Start creating a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Click save and verify loading state
    await page.click('[data-testid="save-button"]');
    const loadingIndicator = await page.locator('[data-testid="loading-indicator"]');
    await expect(loadingIndicator).toBeVisible();

    // Wait for operation to complete
    await expect(loadingIndicator).not.toBeVisible();
    await expect(page.locator('[data-testid="mapping-status"]')).toContainText('Mapping saved');
  });

  test('should handle multiple operations in sequence', async ({ page }) => {
    // Create first mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Create second mapping
    await page.selectOption('[data-testid="source-form"]', { index: 2 });
    await page.selectOption('[data-testid="source-field"]', { index: 2 });
    await page.selectOption('[data-testid="target-field"]', { index: 2 });
    await page.click('[data-testid="save-button"]');

    // Verify both mappings exist
    const mappingItems = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItems).toHaveCount(2);

    // Remove first mapping
    await page.click('[data-testid="remove-mapping"]:first-child');
    await expect(mappingItems).toHaveCount(1);

    // Undo removal
    await page.click('[data-testid="undo-button"]');
    await expect(mappingItems).toHaveCount(2);

    // Redo removal
    await page.click('[data-testid="redo-button"]');
    await expect(mappingItems).toHaveCount(1);
  });
}); 