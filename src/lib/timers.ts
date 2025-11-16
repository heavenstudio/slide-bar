/**
 * Timer utilities for slideshow functionality
 * Separated for easier testing with mocks
 */

/**
 * Create an interval that calls callback every intervalMs
 */
export const createInterval = (callback: () => void, intervalMs: number): NodeJS.Timeout => {
  return setInterval(callback, intervalMs);
};

/**
 * Clear an interval
 */
export const clearIntervalTimer = (timer: NodeJS.Timeout): void => {
  clearInterval(timer);
};
