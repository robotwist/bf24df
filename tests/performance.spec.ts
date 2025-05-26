import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
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

  test('should handle large form loading efficiently', async ({ page }) => {
    // Mock large form data
    await page.route('**/api/forms', async route => {
      const largeForm = {
        id: 'large-form',
        name: 'Large Form',
        fields: Array.from({ length: 100 }, (_, i) => ({
          id: `field-${i}`,
          name: `Field ${i}`,
          type: 'string',
          required: false
        }))
      };
      await route.fulfill({ json: [largeForm] });
    });

    // Measure load time
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('[data-testid="mapping-editor"]');
    const loadTime = Date.now() - startTime;

    // Verify load time is within acceptable range (e.g., under 2 seconds)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle multiple mapping operations efficiently', async ({ page }) => {
    // Create multiple mappings
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
      await page.waitForFunction(
        () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
      );
      await page.selectOption('[data-testid="source-form"]', { index: 1 });
      await page.selectOption('[data-testid="source-field"]', { index: 1 });
      await page.selectOption('[data-testid="target-field"]', { index: 1 });
      await page.click('[data-testid="save-button"]');
      await page.waitForSelector('[data-testid="mapping-item"]');
    }
    const operationTime = Date.now() - startTime;

    // Verify operation time is within acceptable range (e.g., under 5 seconds)
    expect(operationTime).toBeLessThan(5000);
  });

  test('should handle state updates efficiently', async ({ page }) => {
    // Create initial mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Measure state update time for multiple operations
    const startTime = Date.now();
    for (let i = 0; i < 5; i++) {
      // Undo
      await page.click('[data-testid="undo-button"]');
      await page.waitForSelector('[data-testid="mapping-item"]', { state: 'visible' });

      // Redo
      await page.click('[data-testid="redo-button"]');
      await page.waitForSelector('[data-testid="mapping-item"]', { state: 'visible' });
    }
    const updateTime = Date.now() - startTime;

    // Verify update time is within acceptable range (e.g., under 2 seconds)
    expect(updateTime).toBeLessThan(2000);
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    // Start multiple operations simultaneously
    const startTime = Date.now();
    const operations = [
      // Create mapping
      async () => {
        await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
        await page.waitForFunction(
          () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
        );
        await page.selectOption('[data-testid="source-form"]', { index: 1 });
        await page.selectOption('[data-testid="source-field"]', { index: 1 });
        await page.selectOption('[data-testid="target-field"]', { index: 1 });
        await page.click('[data-testid="save-button"]');
      },
      // Apply transformation
      async () => {
        await page.selectOption('[data-testid="transformation-select"]', 'uppercase');
      },
      // Update preview
      async () => {
        await page.fill('[data-testid="preview-input"]', 'test value');
      }
    ];

    await Promise.all(operations.map(op => op()));
    const operationTime = Date.now() - startTime;

    // Verify operation time is within acceptable range (e.g., under 3 seconds)
    expect(operationTime).toBeLessThan(3000);
  });

  test('should maintain performance with large state history', async ({ page }) => {
    // Create initial mapping
    await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
    );
    await page.selectOption('[data-testid="source-form"]', { index: 1 });
    await page.selectOption('[data-testid="source-field"]', { index: 1 });
    await page.selectOption('[data-testid="target-field"]', { index: 1 });
    await page.click('[data-testid="save-button"]');

    // Create large history
    const startTime = Date.now();
    for (let i = 0; i < 50; i++) {
      // Modify mapping
      await page.selectOption('[data-testid="transformation-select"]', 'uppercase');
      await page.fill('[data-testid="preview-input"]', `test value ${i}`);
      await page.click('[data-testid="save-button"]');
    }
    const historyTime = Date.now() - startTime;

    // Verify history operations are still performant (e.g., under 10 seconds)
    expect(historyTime).toBeLessThan(10000);

    // Test undo/redo performance
    const undoStartTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="undo-button"]');
      await page.waitForSelector('[data-testid="mapping-item"]', { state: 'visible' });
    }
    const undoTime = Date.now() - undoStartTime;

    // Verify undo operations are still performant (e.g., under 2 seconds)
    expect(undoTime).toBeLessThan(2000);
  });
}); 