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

test('shows data preview when selecting source and target fields', async ({ page }) => {
  // Navigate to the form structure page
  await page.goto('http://localhost:3003');
  await page.waitForSelector('.dagNode');

  // Click on a form to view details
  await page.click('.dagNode');
  await page.waitForSelector('.formDetails');

  // Click edit mappings button
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('.mapping-editor');

  // Select source and target fields
  await page.selectOption('select[data-testid="source-form"]', 'form1');
  await page.selectOption('select[data-testid="source-field"]', 'string_field');
  await page.selectOption('select[data-testid="target-field"]', 'text_field');

  // Verify preview section is shown
  const previewSection = await page.waitForSelector('.previewSection');
  expect(previewSection).toBeTruthy();

  // Verify raw and transformed values are displayed
  const rawValue = await page.textContent('.previewItem:first-child pre');
  const transformedValue = await page.textContent('.previewItem:last-child pre');
  
  expect(rawValue).toContain('Sample Text');
  expect(transformedValue).toContain('Sample Text');
});

test('applies healthcare field templates', async ({ page }) => {
  // Navigate to the form structure page
  await page.goto('http://localhost:3003');
  await page.waitForSelector('.dagNode');

  // Click on a form to view details
  await page.click('.dagNode');
  await page.waitForSelector('.formDetails');

  // Click edit mappings button
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('.mapping-editor');

  // Select source form
  await page.selectOption('select[data-testid="source-form"]', 'form1');

  // Verify template buttons are enabled
  const templateButtons = await page.$$('.templateButton:not([disabled])');
  expect(templateButtons.length).toBeGreaterThan(0);

  // Click on Patient Information template
  await page.click('button:has-text("Patient Information")');

  // Verify mappings were created
  const mappings = await page.$$('.mapping-item');
  expect(mappings.length).toBeGreaterThan(0);

  // Verify specific fields were mapped
  const mappingText = await page.textContent('.mapping-info');
  expect(mappingText).toContain('patient_first_name');
  expect(mappingText).toContain('patient_last_name');
});

test('applies complex data transformations', async ({ page }) => {
  // Navigate to the form structure page
  await page.goto('http://localhost:3003');
  await page.waitForSelector('.dagNode');

  // Click on a form to view details
  await page.click('.dagNode');
  await page.waitForSelector('.formDetails');

  // Click edit mappings button
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('.mapping-editor');

  // Select source and target fields
  await page.selectOption('select[data-testid="source-form"]', 'form1');
  await page.selectOption('select[data-testid="source-field"]', 'string_field');
  await page.selectOption('select[data-testid="target-field"]', 'text_field');

  // Select a transformation
  await page.selectOption('select[data-testid="transformation-select"]', 'uppercase');

  // Verify preview shows transformed value
  const transformedValue = await page.textContent('.previewItem:last-child pre');
  expect(transformedValue).toContain('SAMPLE TEXT');

  // Test replace transformation
  await page.selectOption('select[data-testid="transformation-select"]', 'replace');
  
  // Enter replace parameters
  await page.fill('input[placeholder="Text to replace"]', 'Sample');
  await page.fill('input[placeholder="Replacement text"]', 'Test');
  
  // Verify preview shows replaced value
  const replacedValue = await page.textContent('.previewItem:last-child pre');
  expect(replacedValue).toContain('Test Text');

  // Test healthcare specific transformation
  await page.selectOption('select[data-testid="source-field"]', 'phone_field');
  await page.selectOption('select[data-testid="transformation-select"]', 'formatPhone');
  
  // Verify phone number is formatted correctly
  const formattedPhone = await page.textContent('.previewItem:last-child pre');
  expect(formattedPhone).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
});

test('validates healthcare-specific fields', async ({ page }) => {
  // Navigate to the form structure page
  await page.goto('http://localhost:3003');
  await page.waitForSelector('.dagNode');

  // Click on a form to view details
  await page.click('.dagNode');
  await page.waitForSelector('.formDetails');

  // Click edit mappings button
  await page.click('button:has-text("Edit Mappings")');
  await page.waitForSelector('.mapping-editor');

  // Select source form
  await page.selectOption('select[data-testid="source-form"]', 'form1');

  // Test phone number validation
  await page.selectOption('select[data-testid="source-field"]', 'phone_field');
  await page.selectOption('select[data-testid="target-field"]', 'phone');
  
  // Verify validation rules are shown
  const validationRules = await page.textContent('.validationRules');
  expect(validationRules).toContain('Phone must be in format (XXX) XXX-XXXX');

  // Test invalid phone number
  await page.selectOption('select[data-testid="transformation-select"]', 'formatPhone');
  const errorMessage = await page.textContent('.validationError');
  expect(errorMessage).toContain('Phone must be in format');

  // Test email validation
  await page.selectOption('select[data-testid="source-field"]', 'email_field');
  await page.selectOption('select[data-testid="target-field"]', 'email');
  
  // Verify validation rules are shown
  const emailRules = await page.textContent('.validationRules');
  expect(emailRules).toContain('Invalid email format');

  // Test date of birth validation
  await page.selectOption('select[data-testid="source-field"]', 'dob_field');
  await page.selectOption('select[data-testid="target-field"]', 'date_of_birth');
  
  // Verify validation rules are shown
  const dobRules = await page.textContent('.validationRules');
  expect(dobRules).toContain('Date of birth must be between 1900 and today');
}); 