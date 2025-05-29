# Testing Documentation

## Overview

This project uses a comprehensive testing strategy with Jest and React Testing Library for unit tests, and Playwright for end-to-end testing. The test suite is organized to ensure thorough coverage of all application components.

## Test Categories

### 1. Service Tests (`tests/services/`)
Tests for core services:
- Transformation Service
  - String transformations
  - Number formatting
  - Date formatting
  - Type validation
- Validation Service
  - Field type validation
  - Mapping validation
  - Error handling

### 2. Hook Tests (`tests/hooks/`)
Tests for custom React hooks:
- useMappingState
  - State management
  - Error handling
  - History operations
- useToasts
  - Toast creation
  - Duration handling
  - Auto-removal

### 3. E2E Tests (`tests/e2e/`)
End-to-end tests covering:
- Form mapping workflow
- DAG visualization
- Error scenarios
- User interactions

## Running Tests

### Prerequisites
- Node.js 18 or higher
- pnpm 8 or higher
- MongoDB 6 or higher

### Installation
```bash
pnpm install
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Test Reports
After running tests, you can find the following reports:
- Jest Coverage Report: `coverage/`
- Playwright Report: `playwright-report/`
- Test Results: `test-results/`

## Test Structure

### Unit Tests
```typescript
describe('Service', () => {
  beforeEach(() => {
    // Setup
  });

  it('should perform specific operation', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Hook Tests
```typescript
describe('useHook', () => {
  it('should handle state correctly', () => {
    const { result } = renderHook(() => useHook());
    expect(result.current.value).toBe(expected);
  });
});
```

### E2E Tests
```typescript
test.describe('Feature', () => {
  test('should complete workflow', async ({ page }) => {
    await page.goto('/');
    // Test implementation
    await expect(page.locator('.result')).toHaveText('Expected');
  });
});
```

## Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Mock external dependencies
   - Use jest.mock for modules
   - Create reusable mock data

3. **Assertions**
   - Be specific in expectations
   - Test edge cases
   - Verify error handling

4. **Performance**
   - Keep tests focused
   - Avoid unnecessary setup
   - Use appropriate timeouts

## Continuous Integration

The test suite runs in CI with:
- Jest for unit tests
- Playwright for E2E tests
- Coverage reporting
- Test result artifacts

## Troubleshooting

### Common Issues

1. **Test Failures**
   - Check test environment
   - Verify mock implementations
   - Review error messages

2. **Timing Issues**
   - Use appropriate waits
   - Consider async operations
   - Handle loading states

3. **Environment Setup**
   - Verify MongoDB connection
   - Check environment variables
   - Review test configuration

### Debugging

1. Use `--debug` flag for detailed logs
2. Check test reports for failure details
3. Review console output for errors

## Contributing

When adding new tests:
1. Follow existing patterns
2. Add appropriate test coverage
3. Include both success and failure cases
4. Update documentation as needed 