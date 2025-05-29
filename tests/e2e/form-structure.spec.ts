import { test, expect } from '@playwright/test';

test('displays form structure correctly', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');

  // Verify form details are displayed
  const formName = await page.textContent('[data-testid="form-name"]');
  expect(formName).toBe('test form');

  const formDescription = await page.textContent('[data-testid="form-description"]');
  expect(formDescription).toBe('test');

  // Verify fields are displayed
  const fields = await page.locator('[data-testid="form-field"]');
  await expect(fields).toHaveCount(8); // Total number of fields in the form

  // Verify field types and names
  const fieldTypes = await page.locator('[data-testid="field-type"]').allTextContents();
  expect(fieldTypes).toContain('string');
  expect(fieldTypes).toContain('array');
  expect(fieldTypes).toContain('object');

  const fieldNames = await page.locator('[data-testid="field-name"]').allTextContents();
  expect(fieldNames).toContain('name');
  expect(fieldNames).toContain('email');
  expect(fieldNames).toContain('multi_select');
  expect(fieldNames).toContain('dynamic_checkbox_group');
  expect(fieldNames).toContain('dynamic_object');
  expect(fieldNames).toContain('id');
  expect(fieldNames).toContain('notes');
  expect(fieldNames).toContain('button');
});

test('shows field validation rules', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');

  // Click on email field to show validation rules
  await page.click('[data-testid="field-name"]:has-text("email")');

  // Verify validation rules are displayed
  const validationRules = await page.locator('[data-testid="validation-rule"]').allTextContents();
  expect(validationRules).toContain('format: email');
  expect(validationRules).toContain('required: true');
});

test('displays dynamic fields correctly', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');

  // Click on dynamic object field
  await page.click('[data-testid="field-name"]:has-text("dynamic_object")');

  // Verify dynamic field properties
  const fieldProperties = await page.locator('[data-testid="field-property"]').allTextContents();
  expect(fieldProperties).toContain('avantos_type: object-enum');
  expect(fieldProperties).toContain('title: Dynamic Object');
});

test('shows field dependencies', async ({ page }) => {
  await page.goto('http://localhost:3003');
  await page.waitForSelector('[data-testid="dag-node"]');
  await page.click('[data-testid="dag-node"]');
  await page.waitForSelector('[data-testid="form-details"]');

  // Click on a field with dependencies
  await page.click('[data-testid="field-name"]:has-text("multi_select")');

  // Verify field properties
  const fieldProperties = await page.locator('[data-testid="field-property"]').allTextContents();
  expect(fieldProperties).toContain('avantos_type: multi-select');
  expect(fieldProperties).toContain('type: array');
  expect(fieldProperties).toContain('uniqueItems: true');
}); 