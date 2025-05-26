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
    () => (document.querySelector('[data-testid="source-form"]') as HTMLSelectElement)?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88');
  await page.selectOption('[data-testid="source-field"]', 'email');
  await page.selectOption('[data-testid="target-field"]', 'multi_select');

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
    () => (document.querySelector('[data-testid="source-form"]') as HTMLSelectElement)?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88');
  await page.selectOption('[data-testid="source-field"]', 'email');
  await page.selectOption('[data-testid="target-field"]', 'email');

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
    () => (document.querySelector('[data-testid="source-form"]') as HTMLSelectElement)?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88');

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
    () => (document.querySelector('[data-testid="source-form"]') as HTMLSelectElement)?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88');
  await page.selectOption('[data-testid="source-field"]', 'name');
  await page.selectOption('[data-testid="target-field"]', 'name');

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
    () => (document.querySelector('[data-testid="source-form"]') as HTMLSelectElement)?.options.length > 1
  );
  await page.selectOption('[data-testid="source-form"]', 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88');

  // Test email validation
  await page.selectOption('[data-testid="source-field"]', 'email');
  await page.selectOption('[data-testid="target-field"]', 'email');

  // Enter invalid email
  await page.fill('[data-testid="preview-input"]', 'invalid-email');

  // Verify validation error
  const errorMessage = await page.textContent('[data-testid="validation-error"]');
  expect(errorMessage).toContain('Invalid email format');
}); 