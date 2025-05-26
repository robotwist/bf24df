import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
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

  test('should support keyboard navigation', async ({ page }) => {
    // Focus source form select
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="source-form"]')).toBeFocused();

    // Navigate through options
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Focus source field select
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="source-field"]')).toBeFocused();

    // Navigate through options
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Focus target field select
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="target-field"]')).toBeFocused();

    // Navigate through options
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Focus save button
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="save-button"]')).toBeFocused();

    // Save mapping
    await page.keyboard.press('Enter');

    // Verify mapping was created
    const mappingItem = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItem).toBeVisible();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check source form select
    const sourceForm = await page.locator('[data-testid="source-form"]');
    await expect(sourceForm).toHaveAttribute('aria-label', 'Source Form');
    await expect(sourceForm).toHaveAttribute('role', 'combobox');

    // Check source field select
    const sourceField = await page.locator('[data-testid="source-field"]');
    await expect(sourceField).toHaveAttribute('aria-label', 'Source Field');
    await expect(sourceField).toHaveAttribute('role', 'combobox');

    // Check target field select
    const targetField = await page.locator('[data-testid="target-field"]');
    await expect(targetField).toHaveAttribute('aria-label', 'Target Field');
    await expect(targetField).toHaveAttribute('role', 'combobox');

    // Check save button
    const saveButton = await page.locator('[data-testid="save-button"]');
    await expect(saveButton).toHaveAttribute('aria-label', 'Save Mapping');
    await expect(saveButton).toHaveAttribute('role', 'button');
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Create a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Check live region for status update
    const liveRegion = await page.locator('[data-testid="status-live-region"]');
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    await expect(liveRegion).toContainText('Mapping saved');
  });

  test('should handle focus management', async ({ page }) => {
    // Create a mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Verify focus moves to the new mapping item
    const mappingItem = await page.locator('[data-testid="mapping-item"]');
    await expect(mappingItem).toBeFocused();

    // Remove mapping
    await page.click('[data-testid="remove-mapping"]');

    // Verify focus moves to the form
    await expect(page.locator('[data-testid="source-form"]')).toBeFocused();
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6');
    const headingTexts = await headings.allTextContents();
    expect(headingTexts).toContain('Form Field Mapping Editor');
    expect(headingTexts).toContain('Create New Mapping');

    // Check landmark regions
    const mainRegion = await page.locator('main');
    await expect(mainRegion).toHaveAttribute('role', 'main');

    const navigationRegion = await page.locator('nav');
    await expect(navigationRegion).toHaveAttribute('role', 'navigation');

    // Check skip link
    const skipLink = await page.locator('[data-testid="skip-link"]');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });
}); 