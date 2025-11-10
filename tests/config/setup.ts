import '@testing-library/jest-dom';

// Suppress test-related console warnings
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Suppress Supabase GoTrueClient multiple instances warning in tests
// This warning is expected in tests where we create fresh instances for isolation
console.warn = (...args: unknown[]): void => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('Multiple GoTrueClient instances detected')) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn(...args);
};

// Suppress React act() warnings in tests
// These warnings occur because async operations in components (like Supabase calls)
// may complete after test cleanup, which is expected behavior in our test environment
console.error = (...args: unknown[]): void => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('was not wrapped in act') || message.includes('Warning: An update'))
  ) {
    return; // Suppress act() warnings
  }
  originalConsoleError(...args);
};
