import { test, expect } from '@playwright/test';

test('validates field types when creating mappings', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('[data-testid="mapping-editor"]');

  // Try to map incompatible fields
  await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', { index: 1 });
  await page.selectOption('[data-testid="source-field"]', { index: 1 });
  await page.selectOption('[data-testid="target-field"]', { index: 1 });

  // Verify validation error is shown
  const errorMessage = await page.textContent('[data-testid="validation-error"]');
  expect(errorMessage).toContain('Incompatible field types');
});

test('shows data preview when selecting source and target fields', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('[data-testid="mapping-editor"]');

  // Select source and target fields
  await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', { index: 1 });
  await page.selectOption('[data-testid="source-field"]', { index: 1 });
  await page.selectOption('[data-testid="target-field"]', { index: 1 });

  // Verify preview section is visible
  const previewSection = await page.locator('[data-testid="preview-section"]');
  await expect(previewSection).toBeVisible();

  // Verify preview items are shown
  const previewItems = await page.locator('[data-testid="preview-item"]');
  await expect(previewItems).toHaveCount(2);
});

test('applies healthcare field templates', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('[data-testid="mapping-editor"]');

  // Select source form
  await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', { index: 1 });

  // Click on a template button
  await page.waitForSelector('[data-testid="template-patient"]', { state: 'visible' });
  await page.click('[data-testid="template-patient"]');

  // Verify mappings were created
  const mappingItems = await page.locator('[data-testid="mapping-item"]');
  await expect(mappingItems).toHaveCount(4); // Patient template has 4 fields
});

test('applies complex data transformations', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('[data-testid="mapping-editor"]');

  // Select source and target fields
  await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', { index: 1 });
  await page.selectOption('[data-testid="source-field"]', { index: 1 });
  await page.selectOption('[data-testid="target-field"]', { index: 1 });

  // Select a transformation
  await page.waitForSelector('[data-testid="transformation-select"]', { state: 'visible' });
  await page.selectOption('[data-testid="transformation-select"]', 'uppercase');

  // Verify preview is updated
  const previewSection = await page.locator('[data-testid="preview-section"]');
  await expect(previewSection).toBeVisible();
  const transformedValue = await page.textContent('[data-testid="preview-item"]:nth-child(2) pre');
  expect(transformedValue).toContain('SAMPLE TEXT');
});

test('validates healthcare-specific fields', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('[data-testid="mapping-editor"]');

  // Select source form
  await page.waitForSelector('[data-testid="source-form"]', { state: 'visible' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="source-form"]')?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', { index: 1 });

  // Test phone number validation
  await page.selectOption('[data-testid="source-field"]', 'phone_field');
  await page.selectOption('[data-testid="target-field"]', 'contact_phone');

  // Enter invalid phone number
  await page.fill('[data-testid="preview-input"]', '1234567890');

  // Verify validation error
  const errorMessage = await page.textContent('[data-testid="validation-error"]');
  expect(errorMessage).toContain('Phone must be in format (XXX) XXX-XXXX');
}); 