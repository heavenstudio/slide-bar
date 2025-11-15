import { test, expect } from '../support/fixtures.js';
import type { Page } from '@playwright/test';
import { TIMEOUTS } from '../support/constants.js';

/**
 * E2E Tests for Settings Feature
 *
 * Feature: Organization Settings Management
 *   As a restaurant/bar owner
 *   I want to configure default slide duration
 *   So that new images use my preferred timing
 */

test.describe('Settings Management', () => {
  test.describe('Basic functionality', () => {
    /**
     * Scenario: Navigate to settings from dashboard
     */
    test('should navigate to settings from dashboard', async ({ page }: { page: Page }) => {
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Slide Bar")');

      // Wait for auth to complete (upload section appears)
      await page.waitForSelector('h2:has-text("Enviar Nova Imagem")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Click settings link
      const settingsLink = page.locator('a:has-text("Configurações")');
      await expect(settingsLink).toBeVisible();
      await settingsLink.click();

      // Should be on settings page
      await page.waitForSelector('h1:has-text("Configurações")');
      expect(page.url()).toContain('/settings');
    });

    /**
     * Scenario: Settings page loads and displays current configuration
     */
    test('should load and display current settings', async ({ page }: { page: Page }) => {
      // Go to dashboard first to ensure auth
      await page.goto('/');
      await page.waitForSelector('h2:has-text("Enviar Nova Imagem")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Navigate to settings
      await page.goto('/settings');

      // Wait for loading to complete
      await page.waitForSelector('h2:has-text("Configurações de Apresentação")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Should show default duration input
      const durationInput = page.locator('input#defaultDuration');
      await expect(durationInput).toBeVisible();

      // Should have a default value (typically 5 seconds)
      const value = await durationInput.inputValue();
      expect(parseFloat(value)).toBeGreaterThan(0);

      // Should show info section
      await expect(page.locator('text=A duração padrão atual é de')).toBeVisible();
    });

    /**
     * Scenario: Back to dashboard link works
     */
    test('should navigate back to dashboard', async ({ page }: { page: Page }) => {
      // Go to dashboard first to ensure auth
      await page.goto('/');
      await page.waitForSelector('h2:has-text("Enviar Nova Imagem")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Navigate to settings
      await page.goto('/settings');
      await page.waitForSelector('h1:has-text("Configurações")');

      const backLink = page.locator('a:has-text("Voltar ao Dashboard")');
      await expect(backLink).toBeVisible();
      await backLink.click();

      await page.waitForSelector('h1:has-text("Slide Bar")');
      expect(page.url()).not.toContain('/settings');
    });
  });

  test.describe('Update default duration', () => {
    /**
     * Scenario: Successfully update default slide duration
     */
    test('should update default duration successfully', async ({ page }: { page: Page }) => {
      // Go to dashboard first to ensure auth
      await page.goto('/');
      await page.waitForSelector('h2:has-text("Enviar Nova Imagem")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Navigate to settings
      await page.goto('/settings');

      // Wait for settings to load
      await page.waitForSelector('h2:has-text("Configurações de Apresentação")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Get duration input
      const durationInput = page.locator('input#defaultDuration');
      await expect(durationInput).toBeVisible();

      // Change to a different value (e.g., 7.5 seconds - use decimal to avoid formatting issues)
      const newValue = '7.5';
      await durationInput.fill(newValue);

      // Click save button
      const saveButton = page.locator('button[type="submit"]');
      await saveButton.click();

      // Wait for success message to confirm save completed
      await expect(page.locator('text=Configurações salvas com sucesso!')).toBeVisible({
        timeout: TIMEOUTS.SELECTOR,
      });

      // Verify the value persisted
      const updatedValue = await durationInput.inputValue();
      expect(updatedValue).toBe(newValue);

      // Verify info section shows new duration
      await expect(
        page.locator(`text=A duração padrão atual é de ${newValue} segundos`)
      ).toBeVisible();
    });

    /**
     * Scenario: Settings persist after page reload
     */
    test('should persist settings after page reload', async ({ page }: { page: Page }) => {
      // Go to dashboard first to ensure auth
      await page.goto('/');
      await page.waitForSelector('h2:has-text("Enviar Nova Imagem")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Navigate to settings
      await page.goto('/settings');
      await page.waitForSelector('h2:has-text("Configurações de Apresentação")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      const durationInput = page.locator('input#defaultDuration');
      const saveButton = page.locator('button:has-text("Salvar Configurações")');

      // Set a specific value
      const testValue = '7.5';
      await durationInput.fill(testValue);
      await saveButton.click();

      // Wait for success
      await expect(page.locator('text=Configurações salvas com sucesso!')).toBeVisible({
        timeout: TIMEOUTS.SELECTOR,
      });

      // Reload page
      await page.reload();
      await page.waitForSelector('h2:has-text("Configurações de Apresentação")', {
        timeout: TIMEOUTS.SELECTOR,
      });

      // Verify value persisted
      const persistedValue = await durationInput.inputValue();
      expect(persistedValue).toBe(testValue);

      // Clean up - restore default
      await durationInput.fill('5.0');
      await saveButton.click();
      await expect(page.locator('text=Configurações salvas com sucesso!')).toBeVisible({
        timeout: TIMEOUTS.SELECTOR,
      });
    });
  });
});
