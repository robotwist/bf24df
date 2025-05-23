import { test, expect } from '@playwright/test';

test('validates field types when creating mappings', async ({ page }) => {
  // Navigate to the form structure page
  await page.goto('http://localhost:3003');
  await page.waitForSelector('.dagNode');

  // Click on a form to view details
  await page.click('.dagNode');
  await page.waitForSelector('.formDetails');

  // Click edit mappings button
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('.mapping-editor');

  // Try to map incompatible fields
  await page.selectOption('select[data-testid="source-field"]', 'string_field');
  await page.selectOption('select[data-testid="target-field"]', 'number_field');

  // Verify validation error is shown
  const errorMessage = await page.textContent('.mapping-error');
  expect(errorMessage).toContain('Incompatible field types');

  // Try to map compatible fields
  await page.selectOption('select[data-testid="source-field"]', 'string_field');
  await page.selectOption('select[data-testid="target-field"]', 'text_field');

  // Verify no error is shown
  const noError = await page.$('.mapping-error');
  expect(noError).toBeNull();
}); 