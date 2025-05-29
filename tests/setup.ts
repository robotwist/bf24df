import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe(): void {
    // Mock implementation
  }
  unobserve(): void {
    // Mock implementation
  }
  disconnect(): void {
    // Mock implementation
  }
}

window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver
class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  private callback: IntersectionObserverCallback;

  observe(): void {
    // Mock implementation
  }
  unobserve(): void {
    // Mock implementation
  }
  disconnect(): void {
    // Mock implementation
  }
}

window.IntersectionObserver = IntersectionObserver;

// Mock fetch
global.fetch = vi.fn();

// Add TextEncoder/TextDecoder for tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock console.error to fail tests
const originalError = console.error;
console.error = (...args: unknown[]) => {
  originalError.call(console, ...args);
  throw new Error(args.join(' '));
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 