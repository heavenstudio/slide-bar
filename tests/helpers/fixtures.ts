import type { Image } from '../../src/types/database';

/**
 * Test Fixtures
 *
 * Factory functions for creating consistent mock data across test files.
 * This eliminates duplication and makes tests more maintainable.
 *
 * Usage:
 * - Use `createMockImage()` for single image objects
 * - Use `createMockImages()` for arrays of images
 * - Override specific fields as needed: `createMockImage({ id: 'custom-id' })`
 */

/**
 * Creates a mock Image object with sensible defaults
 *
 * @param overrides - Optional fields to override defaults
 * @returns A complete Image object suitable for testing
 *
 * @example
 * const image = createMockImage();
 * const customImage = createMockImage({ id: '123', original_name: 'custom.jpg' });
 */
export function createMockImage(overrides?: Partial<Image>): Image {
  const defaults: Image = {
    id: '1',
    url: '/uploads/test.jpg',
    filename: 'test.jpg',
    original_name: 'test.jpg',
    mime_type: 'image/jpeg',
    size: 50000,
    path: '/uploads/test.jpg',
    organization_id: 'org-1',
    created_at: '2025-11-09T00:00:00Z',
    updated_at: '2025-11-09T00:00:00Z',
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates an array of mock Image objects
 *
 * @param count - Number of images to create (default: 2)
 * @param baseOverrides - Optional fields to apply to all images
 * @returns Array of Image objects with unique IDs
 *
 * @example
 * const images = createMockImages(3);
 * const jpegImages = createMockImages(2, { mime_type: 'image/jpeg' });
 */
export function createMockImages(count: number = 2, baseOverrides?: Partial<Image>): Image[] {
  return Array.from({ length: count }, (_, index) => {
    const num = index + 1;
    return createMockImage({
      id: `${num}`,
      url: `/uploads/image${num}.jpg`,
      filename: `image${num}.jpg`,
      original_name: `test${num}.jpg`,
      path: `/uploads/image${num}.jpg`,
      ...baseOverrides,
    });
  });
}

/**
 * Creates a mock PNG image
 *
 * @param overrides - Optional fields to override defaults
 * @returns Image object with PNG mime type
 */
export function createMockPngImage(overrides?: Partial<Image>): Image {
  return createMockImage({
    filename: 'test.png',
    original_name: 'test.png',
    mime_type: 'image/png',
    url: '/uploads/test.png',
    path: '/uploads/test.png',
    ...overrides,
  });
}

/**
 * Creates a mock image with a large file size (for size formatting tests)
 *
 * @param sizeInBytes - File size in bytes
 * @param overrides - Optional fields to override defaults
 * @returns Image object with specified size
 */
export function createMockImageWithSize(sizeInBytes: number, overrides?: Partial<Image>): Image {
  return createMockImage({
    size: sizeInBytes,
    ...overrides,
  });
}

/**
 * Creates a mock Supabase storage upload response
 *
 * @param path - Storage path (default: 'test-id/test.jpg')
 * @returns Storage upload response object
 */
export function createMockStorageData(path: string = 'test-id/test.jpg') {
  return { path };
}

/**
 * Predefined mock images for common test scenarios
 */
export const mockImages = {
  /** Small JPEG image (50KB) */
  smallJpeg: createMockImage({
    id: 'small-jpeg',
    size: 50000,
    mime_type: 'image/jpeg',
  }),

  /** Large JPEG image (2MB) */
  largeJpeg: createMockImage({
    id: 'large-jpeg',
    size: 2000000,
    mime_type: 'image/jpeg',
  }),

  /** PNG image (75KB) */
  png: createMockPngImage({
    id: 'png-image',
    size: 75000,
  }),

  /** Image with null URL (for filtering tests) */
  nullUrl: createMockImage({
    id: 'null-url',
    url: null as unknown as string,
  }),

  /** Image with empty URL (for filtering tests) */
  emptyUrl: createMockImage({
    id: 'empty-url',
    url: '',
  }),
};
