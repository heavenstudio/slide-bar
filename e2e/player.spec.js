import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

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
    await page.waitForTimeout(1000);

    const testImagePath = path.join(__dirname, '../packages/backend/tests/fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000);

    // Now navigate to player
    await page.goto('/player');

    // Wait for player to load
    await page.waitForTimeout(2000);

    // Should show an image
    const image = page.locator('img');
    await expect(image).toBeVisible();

    // Should show slide counter
    const counter = page.locator('text=/\\d+ \\/ \\d+/');
    await expect(counter).toBeVisible();
  });

  /**
   * Scenario: Player shows empty state when no images exist
   *   Given I have no uploaded images
   *   When I navigate to /player
   *   Then I should see "Nenhuma imagem disponível"
   */
  test('should show empty state when no images uploaded', async ({ page }) => {
    // Go directly to player without uploading anything
    await page.goto('/player');

    // Wait for page to load
    await page.waitForTimeout(2000);

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
   * Scenario: Player shows keyboard controls
   *   Given I am on the player page
   *   When the page loads
   *   Then I should see keyboard control instructions
   */
  test('should display keyboard controls hint', async ({ page }) => {
    // First upload an image
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Slide Bar")');
    await page.waitForTimeout(1000);

    const testImagePath = path.join(__dirname, '../packages/backend/tests/fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000);

    // Navigate to player
    await page.goto('/player');
    await page.waitForTimeout(1000);

    // Should show keyboard hints
    await expect(page.locator('text=Espaço')).toBeVisible();
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
    await page.waitForTimeout(1000);

    const testImagePath = path.join(__dirname, '../packages/backend/tests/fixtures/test-image.jpg');
    const fileInput = page.locator('input[type="file"]');

    // Upload 2 images
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000);
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000);

    // Navigate to player
    await page.goto('/player');
    await page.waitForTimeout(1000);

    // Should show counter with multiple images
    const counter = page.locator('text=/[12] \\/ 2/');
    await expect(counter).toBeVisible();
  });
});
