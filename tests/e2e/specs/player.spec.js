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

test.describe('Player Slideshow', () => {
  /**
   * Helper function to delete all images from dashboard
   */
  async function _deleteAllImages(page) {
    // Navigate to dashboard to trigger auth
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');

    // Delete all images to start with clean state
    const imageCards = page.locator('[data-testid="image-card"]');
    const count = await imageCards.count();

    for (let i = 0; i < count; i++) {
      // Always delete the first card (index shifts after each deletion)
      const deleteButton = imageCards.first().locator('button:has-text("Excluir")');
      await deleteButton.click();

      // Wait for confirmation and confirm
      const confirmButton = page.locator('button:has-text("Sim, excluir")');
      await confirmButton.click();

      // Wait for the image card to be removed from DOM
      await page
        .waitForSelector('[data-testid="image-card"]', { state: 'detached', timeout: 5000 })
        .catch(() => {
          // If no cards exist, the selector won't be found which is fine
        });
    }
  }

  /**
   * Scenario: Player shows empty state when no images exist
   *   Given I have no uploaded images
   *   When I navigate to /player
   *   Then I should see "Nenhuma imagem disponível"
   */
  test('should show empty state when no images uploaded', async ({ page }) => {
    // Go directly to player without uploading anything
    await page.goto('/player');

    // Wait for player to load
    await page.waitForLoadState('networkidle');

    // Should show empty state message
    await expect(page.locator('text=Nenhuma imagem disponível')).toBeVisible();
  });

  /**
   * Scenario: Player is accessible without authentication
   *   Given I am not logged in
   *   When I navigate to /player
   *   Then I should see the player (no login required)
   */
  test('should work without authentication', async ({ page }) => {
    // Clear all storage to ensure no auth token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Go to player
    await page.goto('/player');

    // Should load without redirect or error
    // Either shows images or empty state, but no auth error
    const errorText = page.locator('text=Authentication');
    await expect(errorText).not.toBeVisible();
  });

  /**
   * Scenario: Dashboard has link to player
   *   Given I am on the dashboard
   *   Then I should see a button to open the player
   */
  test('should have player link in dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');

    // Should show "Abrir Player" button
    const playerButton = page.locator('a:has-text("Abrir Player")');
    await expect(playerButton).toBeVisible();

    // Should have correct href
    const href = await playerButton.getAttribute('href');
    expect(href).toBe('/player');

    // Should open in new tab
    const target = await playerButton.getAttribute('target');
    expect(target).toBe('_blank');
  });

  /**
   * Scenario: Player shows progress indicator
   *   Given I have multiple images uploaded
   *   When I am on the player page
   *   Then I should see a progress bar
   */
  test('should show progress indicator with multiple images', async ({ page }) => {
    // Upload multiple images
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');

    // Upload first image and wait for it to appear
    await fileInput.setInputFiles(testImagePath);
    await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });
    const firstImageCount = await page.locator('[data-testid="image-card"]').count();
    expect(firstImageCount).toBe(1);

    // Upload second image and wait for it to appear
    await fileInput.setInputFiles(testImagePath);
    await page.waitForFunction(
      (expectedCount) => {
        return document.querySelectorAll('[data-testid="image-card"]').length === expectedCount;
      },
      2, // expecting 2 images
      { timeout: TIMEOUTS.SELECTOR }
    );

    // Navigate to player
    await page.goto('/player');

    // Should show counter with multiple images
    const counter = page.locator('text=/[12] \\/ 2/');
    await expect(counter).toBeVisible();
  });

  /**
   * Scenario: Player displays when images exist
   *   Given I have uploaded images
   *   When I navigate to /player
   *   Then I should see the first image fullscreen
   *   And I should see a slide counter
   */
  test('should display images in fullscreen slideshow', async ({ page }) => {
    // First, upload an image via the dashboard
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });

    // Now navigate to player
    await page.goto('/player');
    await page.waitForLoadState('networkidle');

    // Should show an image
    const image = page.locator('img');
    await expect(image).toBeVisible();

    // Should show slide counter
    const counter = page.locator('text=/\\d+ \\/ \\d+/');
    await expect(counter).toBeVisible();
  });

  /**
   * Scenario: Player shows keyboard controls
   *   Given I am on the player page
   *   When the page loads
   *   Then I should see keyboard control instructions
   */
  test('should display keyboard controls hint', async ({ page }) => {
    // First upload an image
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });

    // Navigate to player
    await page.goto('/player');
    await page.waitForLoadState('networkidle');

    // Should show keyboard hints
    await expect(page.locator('text=Espaço')).toBeVisible();
  });

  /**
   * Scenario: Player receives real-time updates when images are uploaded
   *   Given I have the player page open in one tab
   *   When I upload a new image in the dashboard (different tab)
   *   Then the player should automatically show the new image without refresh
   */
  test('should update in real-time when new images are uploaded', async ({ page, context }) => {
    // Open player in first tab
    await page.goto('/player');
    await page.waitForLoadState('networkidle');

    // Verify player shows empty state
    await expect(page.locator('text=Nenhuma imagem disponível')).toBeVisible();

    // Open dashboard in second tab
    const dashboardPage = await context.newPage();
    await dashboardPage.goto('/');
    await dashboardPage.waitForSelector('h1:has-text("Slide Bar")');
    await dashboardPage.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    // Upload an image in the dashboard
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = dashboardPage.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await dashboardPage.waitForSelector('[data-testid="image-card"]', {
      timeout: TIMEOUTS.SELECTOR,
    });

    // Switch back to player tab and verify it automatically updated
    // The player should now show the image without requiring a page refresh
    await expect(page.locator('img')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=1 / 1')).toBeVisible();

    // Clean up
    await dashboardPage.close();
  });

  /**
   * Scenario: Player shows empty state when last image is deleted
   *   Given I am viewing the only image in the player
   *   When that image is deleted from the dashboard
   *   Then the player should show empty state (not blank screen)
   */
  test('should show empty state when last image is deleted', async ({ page, context }) => {
    // Upload one image via dashboard
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });

    // Open player in new tab
    const playerPage = await context.newPage();
    await playerPage.goto('/player');
    await playerPage.waitForLoadState('networkidle');

    // Verify player shows the image
    await expect(playerPage.locator('img')).toBeVisible();
    await expect(playerPage.locator('text=1 / 1')).toBeVisible();

    // Setup dialog handler to auto-accept confirmation
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Delete the image from dashboard
    const imageCard = page.locator('[data-testid="image-card"]');
    await imageCard.hover();
    const deleteButton = page.locator('[data-testid="delete-button"]').first();
    await deleteButton.click({ force: true });

    // Wait for the image to be deleted from dashboard (DOM removal)
    await expect(page.locator('[data-testid="image-card"]')).not.toBeVisible({ timeout: 5000 });

    // Player should automatically show empty state via Realtime subscription
    // The player reloads images when it receives a DELETE event, which triggers re-render
    // Wait for either the empty state text OR for the image to disappear first
    await Promise.race([
      expect(playerPage.locator('text=Nenhuma imagem disponível')).toBeVisible({ timeout: 15000 }),
      expect(playerPage.locator('img')).not.toBeVisible({ timeout: 15000 }),
    ]);

    // Then verify both conditions are met
    await expect(playerPage.locator('text=Nenhuma imagem disponível')).toBeVisible();
    await expect(playerPage.locator('img')).not.toBeVisible();

    // Clean up
    await playerPage.close();
  });

  /**
   * Scenario: Player shows next image when current image is deleted
   *   Given I am viewing one of multiple images
   *   When that specific image is deleted
   *   Then the player should show another image (not blank screen)
   */
  test('should show next image when current image is deleted', async ({ page, context }) => {
    // Upload two images
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForSelector('h2:has-text("Enviar Nova Imagem")');

    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');

    // Upload first image
    await fileInput.setInputFiles(testImagePath);
    await page.waitForSelector('[data-testid="image-card"]', { timeout: TIMEOUTS.SELECTOR });

    // Upload second image
    await fileInput.setInputFiles(testImagePath);
    await page.waitForFunction(
      (expectedCount) => {
        return document.querySelectorAll('[data-testid="image-card"]').length === expectedCount;
      },
      2,
      { timeout: TIMEOUTS.SELECTOR }
    );

    // Open player in new tab
    const playerPage = await context.newPage();
    await playerPage.goto('/player');
    await playerPage.waitForLoadState('networkidle');

    // Verify player shows images
    await expect(playerPage.locator('img')).toBeVisible();
    await expect(playerPage.locator('text=/[12] \\/ 2/')).toBeVisible();

    // Pause the slideshow so we stay on current image
    await playerPage.keyboard.press('Space');
    await expect(playerPage.locator('text=Pausado')).toBeVisible();

    // Setup dialog handler to auto-accept confirmation
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Delete one image from dashboard
    const firstImageCard = page.locator('[data-testid="image-card"]').first();
    await firstImageCard.hover();
    const deleteButton = page.locator('[data-testid="delete-button"]').first();
    await deleteButton.click({ force: true });

    // Wait for one image card to be removed from dashboard
    await page.waitForFunction(
      () => document.querySelectorAll('[data-testid="image-card"]').length === 1,
      { timeout: 5000 }
    );

    // Player should still show an image via Realtime subscription (not blank screen)
    // The player reloads images when it receives a DELETE event
    // Wait for the counter to update to "1 / 1" which indicates Realtime worked
    await expect(playerPage.locator('text=1 / 1')).toBeVisible({ timeout: 15000 });
    await expect(playerPage.locator('img')).toBeVisible();

    // Clean up
    await playerPage.close();
  });
});
