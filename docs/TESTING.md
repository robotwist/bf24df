# Testing Documentation

## Overview

This project uses Playwright for end-to-end testing. The test suite is organized into several categories to ensure comprehensive coverage of the application's functionality.

## Test Categories

### 1. State Management Tests (`state-management.spec.ts`)
Tests the application's state management capabilities:
- Undo/redo operations
- State persistence between sessions
- Loading states during operations
- Multiple operations handling

### 2. Error Handling Tests (`error-handling.spec.ts`)
Verifies proper error handling:
- Network errors
- Validation errors
- Transformation errors
- Concurrent operation errors
- State corruption recovery

### 3. Accessibility Tests (`accessibility.spec.ts`)
Ensures the application is accessible:
- Keyboard navigation
- ARIA attributes
- Dynamic content announcements
- Focus management
- Screen reader support

### 4. Performance Tests (`performance.spec.ts`)
Validates application performance:
- Large form loading
- Multiple mapping operations
- State updates
- Concurrent operations
- Large state history handling

## Running Tests

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation
```bash
npm install
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test tests/state-management.spec.ts

# Run tests in UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

### Test Reports
After running tests, you can find the following reports:
- HTML Report: `playwright-report/index.html`
- JSON Report: `test-results/test-results.json`
- JUnit Report: `test-results/junit.xml`

## Test Structure

Each test file follows this structure:
1. `beforeEach` hook for common setup
2. Individual test cases with clear descriptions
3. Assertions to verify expected behavior

Example:
```typescript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
  });

  test('should do something specific', async ({ page }) => {
    // Test code
    // Assertions
  });
});
```

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Use `beforeEach` for common setup
   - Clean up after tests

2. **Selectors**
   - Use `data-testid` attributes for reliable selection
   - Avoid using CSS selectors that might change
   - Keep selectors semantic and meaningful

3. **Assertions**
   - Be specific in assertions
   - Test both positive and negative cases
   - Verify error states and edge cases

4. **Performance**
   - Keep tests focused and efficient
   - Avoid unnecessary waiting
   - Use appropriate timeouts

## Continuous Integration

The test suite is configured to run in CI environments with:
- Retry on failure (2 attempts)
- Single worker to prevent race conditions
- HTML and JUnit reports generation
- Screenshot and video capture on failure

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check for timing issues
   - Verify environment variables
   - Review CI logs for details

2. **Flaky tests**
   - Add appropriate waits
   - Use reliable selectors
   - Consider retry mechanisms

3. **Performance issues**
   - Review test timeouts
   - Check for unnecessary operations
   - Optimize test setup

### Debugging

1. Use `npm run test:debug` for step-by-step debugging
2. Check `playwright-report` for detailed failure information
3. Review screenshots and videos in the test report

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Add appropriate test IDs
3. Include both positive and negative test cases
4. Document any special setup requirements
5. Update this documentation if necessary 