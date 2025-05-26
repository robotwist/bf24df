# TypeScript Style Guide

This document outlines the coding standards and best practices for TypeScript development in this project.

## General Principles

1. **Type Safety**
   - Use TypeScript's type system to its full potential
   - Avoid using `any` type
   - Use proper type definitions for all variables, parameters, and return types

2. **Code Organization**
   - Follow the project's directory structure
   - Keep files focused and single-responsibility
   - Use meaningful file and directory names

3. **Naming Conventions**
   - Use PascalCase for types, interfaces, and classes
   - Use camelCase for variables, functions, and methods
   - Use UPPER_CASE for constants
   - Use descriptive names that reflect purpose

## TypeScript Specific

### Types and Interfaces

```typescript
// Prefer interfaces for object types
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type aliases for unions and intersections
type UserRole = 'admin' | 'user' | 'guest';
type UserWithRole = User & { role: UserRole };

// Use enums for fixed sets of values
enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}
```

### Functions

```typescript
// Use explicit return types
function getUser(id: string): Promise<User> {
  // ...
}

// Use arrow functions for callbacks
const users = data.map((user: User) => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`
}));

// Use async/await over raw promises
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}
```

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// Use proper event types
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
};
```

### Error Handling

```typescript
// Use custom error types
class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Use type guards
function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

// Handle errors properly
try {
  await fetchData();
} catch (error) {
  if (isAPIError(error)) {
    // Handle API error
  } else {
    // Handle other errors
  }
}
```

## Best Practices

1. **Imports**
   - Use absolute imports with `@/` prefix
   - Group imports by type (React, third-party, local)
   - Use named imports over default imports

2. **Comments**
   - Use JSDoc for public APIs
   - Keep comments up to date
   - Comment complex logic

3. **Testing**
   - Write tests for all new features
   - Use proper type assertions in tests
   - Mock external dependencies

4. **Performance**
   - Use proper React hooks
   - Memoize expensive computations
   - Avoid unnecessary re-renders

## ESLint Rules

```json
{
  "@typescript-eslint/explicit-function-return-type": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-non-null-assertion": "error"
}
```

## Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
``` 