import { test, expect } from '@playwright/test';

// This file serves as the central entry point for all tests
// Add new test groups below as features are developed

test.describe('Graph Data', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the graph data to load with a more specific selector
    try {
      await page.waitForSelector('.graph-stats', { state: 'visible', timeout: 30000 });
    } catch (error) {
      console.error('Failed to find .graph-stats element');
      // Log the page content for debugging
      const content = await page.content();
      console.error('Page content:', content);
      throw error;
    }
  });

  test('should display graph data correctly', async ({ page }) => {
    const stats = await page.locator('.graph-stats');
    await expect(stats).toBeVisible();
    
    const statsText = await stats.textContent();
    expect(statsText).toContain('Nodes:');
    expect(statsText).toContain('Forms:');
    expect(statsText).toContain('Edges:');
  });
});

test.describe('Field Mapping', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the graph data to load with a more specific selector
    try {
      await page.waitForSelector('.graph-stats', { state: 'visible', timeout: 30000 });
    } catch (error) {
      console.error('Failed to find .graph-stats element');
      // Log the page content for debugging
      const content = await page.content();
      console.error('Page content:', content);
      throw error;
    }
  });

  test('should open mapping editor', async ({ page }) => {
    const firstForm = await page.locator('.form-item').first();
    await expect(firstForm).toBeVisible();

    const editButton = await firstForm.locator('.edit-mappings');
    await editButton.click();

    const mappingEditor = await page.locator('.mapping-editor');
    await expect(mappingEditor).toBeVisible();
  });

  test('should close mapping editor', async ({ page }) => {
    const firstForm = await page.locator('.form-item').first();
    await expect(firstForm).toBeVisible();

    const editButton = await firstForm.locator('.edit-mappings');
    await editButton.click();

    const mappingEditor = await page.locator('.mapping-editor');
    await expect(mappingEditor).toBeVisible();

    const closeButton = await page.locator('.close-button');
    await closeButton.click();

    await expect(mappingEditor).not.toBeVisible();
  });

  test('should create and save a field mapping', async ({ page }) => {
    const firstForm = await page.locator('.form-item').first();
    await expect(firstForm).toBeVisible();

    const editButton = await firstForm.locator('.edit-mappings');
    await editButton.click();

    const mappingEditor = await page.locator('.mapping-editor');
    await expect(mappingEditor).toBeVisible();

    // Add mapping test steps will go here
    // This is a placeholder for now
  });

  test('should handle invalid mappings', async ({ page }) => {
    const firstForm = await page.locator('.form-item').first();
    await expect(firstForm).toBeVisible();

    const editButton = await firstForm.locator('.edit-mappings');
    await editButton.click();

    const mappingEditor = await page.locator('.mapping-editor');
    await expect(mappingEditor).toBeVisible();

    // Invalid mapping test steps will go here
    // This is a placeholder for now
  });

  test('should remove a mapping', async ({ page }) => {
    const firstForm = await page.locator('.form-item').first();
    await expect(firstForm).toBeVisible();

    const editButton = await firstForm.locator('.edit-mappings');
    await editButton.click();

    const mappingEditor = await page.locator('.mapping-editor');
    await expect(mappingEditor).toBeVisible();

    // Remove mapping test steps will go here
    // This is a placeholder for now
  });
}); 