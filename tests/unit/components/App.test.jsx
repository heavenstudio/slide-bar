import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import App from '../../../src/App';
import { setupSupabaseCleanup, cleanDatabase } from '../../helpers/supabase.js';

// Setup automatic database cleanup after each test
setupSupabaseCleanup();

/**
 * App Component Tests
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 100%
 *
 * Test categories:
 * 1. Basic rendering (smoke test)
 * 2. Router setup and routes
 * 3. Component rendering at different routes
 */
describe('App', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
  });

  // ======================
  // 1. Basic Rendering Tests
  // ======================

  it('should render without crashing (smoke test)', async () => {
    render(<App />);

    // App should render and default to "/" route (Dashboard)
    await waitFor(
      () => {
        expect(screen.getByText('Slide Bar')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should render Dashboard component by default', async () => {
    render(<App />);

    // Wait for Dashboard to render
    await waitFor(
      () => {
        expect(screen.getByText('Slide Bar')).toBeInTheDocument();
        expect(screen.getByText(/Gerencie suas imagens/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show upload section after auth
    await waitFor(
      () => {
        expect(screen.getByText(/Enviar Nova Imagem/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  // Note: Testing navigation to /player route is difficult in jsdom
  // because BrowserRouter uses window.history which requires full browser
  // E2E tests cover the player route navigation thoroughly
  // The App component's routing structure is simple and tested via:
  // 1. Default route rendering (above)
  // 2. E2E tests that navigate between routes
  // 3. Individual page component tests
});
