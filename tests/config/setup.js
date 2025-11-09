import '@testing-library/jest-dom';

// Suppress Supabase GoTrueClient multiple instances warning in tests
// This warning is expected in tests where we create fresh instances for isolation
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('Multiple GoTrueClient instances detected')) {
    return; // Suppress this specific warning
  }
  originalConsoleWarn(...args);
};
