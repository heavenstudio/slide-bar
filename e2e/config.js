/**
 * E2E Test Configuration
 *
 * Centralized configuration for E2E tests including timeouts and wait times.
 */

export const TIMEOUTS = {
  // Selector waits
  SELECTOR: 5000, // Wait for elements to appear
  SELECTOR_LONG: 10000, // Wait for slow-loading elements

  // Network operations
  NETWORK: 10000, // API calls and network requests
  UPLOAD: 15000, // File upload operations

  // Server startup
  SERVER_START: 60000, // Wait for development servers to start

  // Page loads
  PAGE_LOAD: 30000, // Full page load timeout
};

export const WAIT_TIMES = {
  // Debounce/throttle waits
  SHORT: 100, // Short wait for UI updates
  MEDIUM: 500, // Medium wait for animations
  LONG: 1000, // Long wait for complex operations
};

export const RETRY = {
  // Retry configuration for flaky operations
  MAX_ATTEMPTS: 3,
  DELAY: 1000, // Delay between retries
};
