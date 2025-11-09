import { test, expect } from '../support/fixtures.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { TIMEOUTS } from '../support/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * E2E Tests for Player Feature
 *
 * Feature: Public Image Player/Slideshow
 *   As a restaurant/bar owner
 *   I want to display my uploaded images on a TV/monitor
 *   So that customers can see my digital signage content
 */

/**
 * Helper: Upload image via dashboard
 */
async function uploadTestImage(page, testImagePath) {
  await page.goto('/');
  await page.waitForSelector('h1:has-text("Slide Bar")');
  await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(testImagePath);
  await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });
}

/**
 * Helper: Upload multiple images
 */
async function uploadMultipleImages(page, testImagePath, count) {
  await page.goto('/');
  await page.waitForSelector('h1:has-text("Slide Bar")');
  await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');
  const fileInput = page.locator('input[type="file"]');

  for (let i = 0; i < count; i++) {
    await fileInput.setInputFiles(testImagePath);
    await page.waitForFunction(
      (expectedCount) =>
        document.querySelectorAll('[data-testid="image-card"]').length === expectedCount,
      i + 1,
      { timeout: TIMEOUTS.SELECTOR }
    );
  }
}

test.describe('Player Slideshow', () => {
  test.describe('Basic functionality', () => {
    /**
     * Scenario: Player shows empty state when no images exist
     */
    test('should show empty state when no images uploaded', async ({ page }) => {
      await page.goto('/player');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Nenhuma imagem disponível')).toBeVisible();
    });

    /**
     * Scenario: Player is accessible without authentication
     */
    test('should work without authentication', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto('/player');
      const errorText = page.locator('text=Authentication');
      await expect(errorText).not.toBeVisible();
    });

    /**
     * Scenario: Dashboard has link to player
     */
    test('should have player link in dashboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Slide Bar")');
      const playerButton = page.locator('a:has-text("Abrir Player")');
      await expect(playerButton).toBeVisible();
      const href = await playerButton.getAttribute('href');
      expect(href).toBe('/player');
      const target = await playerButton.getAttribute('target');
      expect(target).toBe('_blank');
    });
  });

  test.describe('Image display', () => {
    /**
     * Scenario: Player shows progress indicator
     */
    test('should show progress indicator with multiple images', async ({ page }) => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadMultipleImages(page, testImagePath, 2);
      await page.goto('/player');
      const counter = page.locator('text=/[12] \\/ 2/');
      await expect(counter).toBeVisible();
    });

    /**
     * Scenario: Player displays when images exist
     */
    test('should display images in fullscreen slideshow', async ({ page }) => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadTestImage(page, testImagePath);
      await page.goto('/player');
      await page.waitForLoadState('networkidle');
      const image = page.locator('img');
      await expect(image).toBeVisible();
      const counter = page.locator('text=/\\d+ \\/ \\d+/');
      await expect(counter).toBeVisible();
    });

    /**
     * Scenario: Player shows keyboard controls
     */
    test('should display keyboard controls hint', async ({ page }) => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadTestImage(page, testImagePath);
      await page.goto('/player');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Espaço')).toBeVisible();
    });
  });

  test.describe('Real-time updates', () => {
    /**
     * Scenario: Player receives real-time updates when images are uploaded
     */
    test('should update in real-time when new images are uploaded', async ({ page, context }) => {
      await page.goto('/player');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Nenhuma imagem disponível')).toBeVisible();

      const dashboardPage = await context.newPage();
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadTestImage(dashboardPage, testImagePath);

      await expect(page.locator('img')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=1 / 1')).toBeVisible();
      await dashboardPage.close();
    });

    /**
     * Scenario: Player shows empty state when last image is deleted
     */
    test('should show empty state when last image is deleted', async ({ page, context }) => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadTestImage(page, testImagePath);

      const playerPage = await context.newPage();
      await playerPage.goto('/player');
      await playerPage.waitForLoadState('networkidle');
      await expect(playerPage.locator('img')).toBeVisible();
      await expect(playerPage.locator('text=1 / 1')).toBeVisible();

      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      const imageCard = page.locator('[data-testid="image-card"]');
      await imageCard.hover();
      const deleteButton = page.locator('[data-testid="delete-button"]').first();
      await deleteButton.click({ force: true });
      await expect(page.locator('[data-testid="image-card"]')).not.toBeVisible({ timeout: 5000 });

      await Promise.race([
        expect(playerPage.locator('text=Nenhuma imagem disponível')).toBeVisible({
          timeout: 15000,
        }),
        expect(playerPage.locator('img')).not.toBeVisible({ timeout: 15000 }),
      ]);

      await expect(playerPage.locator('text=Nenhuma imagem disponível')).toBeVisible();
      await expect(playerPage.locator('img')).not.toBeVisible();
      await playerPage.close();
    });

    /**
     * Scenario: Player shows next image when current image is deleted
     */
    test('should show next image when current image is deleted', async ({ page, context }) => {
      const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
      await uploadMultipleImages(page, testImagePath, 2);

      const playerPage = await context.newPage();
      await playerPage.goto('/player');
      await playerPage.waitForLoadState('networkidle');
      await expect(playerPage.locator('img')).toBeVisible();
      await expect(playerPage.locator('text=/[12] \\/ 2/')).toBeVisible();

      await playerPage.keyboard.press('Space');
      await expect(playerPage.locator('text=Pausado')).toBeVisible();

      page.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      const firstImageCard = page.locator('[data-testid="image-card"]').first();
      await firstImageCard.hover();
      const deleteButton = page.locator('[data-testid="delete-button"]').first();
      await deleteButton.click({ force: true });

      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid="image-card"]').length === 1,
        { timeout: 5000 }
      );

      await expect(playerPage.locator('text=1 / 1')).toBeVisible({ timeout: 15000 });
      await expect(playerPage.locator('img')).toBeVisible();
      await playerPage.close();
    });
  });
});
