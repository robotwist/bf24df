import { test, expect } from '@playwright/test';

// This file serves as the central entry point for all tests
// Add new test groups below as features are developed

test.describe('Graph Data', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('http://localhost:3003');
    
    // Wait for the graph data to load
    try {
      await page.waitForSelector('[data-testid="stats"]', { state: 'visible', timeout: 30000 });
    } catch (error) {
      console.error('Failed to find stats element');
      const content = await page.content();
      console.error('Page content:', content);
      throw error;
    }
  });

  test('should display graph data correctly', async ({ page }) => {
    const stats = await page.locator('[data-testid="stats"]');
    await expect(stats).toBeVisible();
    
    const statsText = await stats.textContent();
    expect(statsText).toContain('Forms:');
    expect(statsText).toContain('Dependencies:');
    expect(statsText).toContain('Total Fields:');

    // Check if DAG nodes are displayed
    const dagNodes = await page.locator('[data-testid="dag-node"]');
    await expect(dagNodes).toHaveCount(6);
  });
});

test.describe('Field Mapping', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('http://localhost:3003');
    
    // Wait for the graph data to load
    try {
      await page.waitForSelector('[data-testid="stats"]', { state: 'visible', timeout: 30000 });
    } catch (error) {
      console.error('Failed to find stats element');
      const content = await page.content();
      console.error('Page content:', content);
      throw error;
    }
  });

  test('should open mapping editor', async ({ page }) => {
    // Click on a form node
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');

    // Click edit mappings button
    await page.click('button:has-text("Edit Mappings")');
    
    // Verify mapping editor is visible
    const mappingEditor = await page.locator('[data-testid="mapping-editor"]');
    await expect(mappingEditor).toBeVisible();
  });

  test('should close mapping editor', async ({ page }) => {
    // Click on a form node
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');

    // Click edit mappings button
    await page.click('button:has-text("Edit Mappings")');
    
    // Verify mapping editor is visible
    const mappingEditor = await page.locator('[data-testid="mapping-editor"]');
    await expect(mappingEditor).toBeVisible();

    // Click close button
    await page.click('[data-testid="close-button"]');
    
    // Verify mapping editor is not visible
    await expect(mappingEditor).not.toBeVisible();
  });

  test('should create and save a field mapping', async ({ page }) => {
    // Click on a form node
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');

    // Click edit mappings button
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');

    // Select source form
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });

    // Wait for source field select to be visible and enabled
    await page.waitForSelector('[data-testid="source-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-field"]', { index: 1 });

    // Wait for target field select to be visible and enabled
    await page.waitForSelector('[data-testid="target-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="target-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Wait for save button to be visible and enabled
    await page.waitForSelector('[data-testid="save-button"]', { state: 'visible' });
    await page.waitForSelector('[data-testid="save-button"]:not([disabled])', { state: 'visible' });
    await page.click('[data-testid="save-button"]');

    // Verify mapping was created
    const mappingItem = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItem).toBeVisible();

    // Verify the mapping was saved
    await expect(page.locator('[data-testid="mapping-status"]')).toContainText('Mapping saved');
  });

  test('should handle invalid mappings', async ({ page }) => {
    // Click on a form node
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');

    // Click edit mappings button
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');

    // Try to map incompatible fields
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });

    // Wait for source field select to be visible and enabled
    await page.waitForSelector('[data-testid="source-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-field"]', { index: 1 });

    // Wait for target field select to be visible and enabled
    await page.waitForSelector('[data-testid="target-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="target-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Verify validation error is shown
    const errorMessage = await page.textContent('[data-testid="validation-error"]');
    expect(errorMessage).toContain('Incompatible field types');
  });

  test('should remove a mapping', async ({ page }) => {
    // Click on a form node
    await page.click('[data-testid="dag-node"]');
    await page.waitForSelector('[data-testid="form-details"]');

    // Click edit mappings button
    await page.click('button:has-text("Edit Mappings")');
    await page.waitForSelector('[data-testid="mapping-editor"]');

    // Create a mapping first
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });

    // Wait for source field select to be visible and enabled
    await page.waitForSelector('[data-testid="source-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-field"]', { index: 1 });

    // Wait for target field select to be visible and enabled
    await page.waitForSelector('[data-testid="target-field"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="target-field"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="target-field"]', { index: 1 });

    // Wait for save button to be visible and enabled
    await page.waitForSelector('[data-testid="save-button"]', { state: 'visible' });
    await page.waitForSelector('[data-testid="save-button"]:not([disabled])', { state: 'visible' });
    await page.click('[data-testid="save-button"]');

    // Click remove button on the mapping
    await page.waitForSelector('[data-testid="remove-mapping"]', { state: 'visible' });
    await page.click('[data-testid="remove-mapping"]');

    // Verify mapping was removed
    const mappingItem = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItem).not.toBeVisible();

    // Verify the mapping was removed
    await expect(page.locator('[data-testid="mapping-status"]')).toContainText('Mapping removed');
  });
}); 