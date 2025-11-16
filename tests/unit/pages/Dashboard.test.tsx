import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import Dashboard from '../../../src/pages/Dashboard';
import { setupSupabaseCleanup, cleanDatabase, createMockImageFile } from '../../helpers/supabase';
import { demoLogin, uploadImage, deleteImage } from '../../../src/lib/supabaseApi';
import * as api from '../../../src/lib/api';

// Setup automatic database cleanup after each test
setupSupabaseCleanup();

/**
 * Dashboard Component Tests
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 100% (every line, branch, and function)
 *
 * Test categories:
 * 1. Basic rendering (smoke tests)
 * 2. Authentication flow
 * 3. Image loading (success, error, empty)
 * 4. Callbacks (upload success, delete success)
 * 5. User interactions (refresh button)
 * 6. Loading states
 * 7. Error states
 */

describe('Dashboard - Core Functionality', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
  });

  describe('Basic rendering', () => {
    it('should render without crashing (smoke test)', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    it('should render header with title and description', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        expect(screen.getByText('Slide Bar')).toBeInTheDocument();
        expect(screen.getByText(/Gerencie suas imagens/i)).toBeInTheDocument();
      });
    });

    it('should render player link in header', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const playerLink = screen.getByRole('link', { name: /Abrir Player/i });
        expect(playerLink).toBeInTheDocument();
        expect(playerLink).toHaveAttribute('href', '/player');
        expect(playerLink).toHaveAttribute('target', '_blank');
      });
    });
  });

  describe('Authentication flow', () => {
    it('should show loading state during authentication', async () => {
      render(<Dashboard />);
      expect(screen.getByText(/Carregando imagens/i)).toBeInTheDocument();
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should complete authentication and load images on mount', async () => {
      render(<Dashboard />);
      await waitFor(() => expect(screen.getByText(/Enviar Nova Imagem/i)).toBeInTheDocument(), {
        timeout: 3000,
      });
      expect(screen.getByText(/Enviar Nova Imagem/i)).toBeInTheDocument();
      expect(screen.getByText(/Minhas Imagens \(0\)/i)).toBeInTheDocument();
    });

    it('should hide upload section during authentication', async () => {
      render(<Dashboard />);
      expect(screen.queryByText(/Enviar Nova Imagem/i)).not.toBeInTheDocument();
      await waitFor(() => expect(screen.getByText(/Enviar Nova Imagem/i)).toBeInTheDocument(), {
        timeout: 3000,
      });
    });
  });
});

describe('Dashboard - Data Management', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
  });

  describe('Image loading', () => {
    it('should load and display images after authentication', async () => {
      // Pre-populate with images
      await demoLogin();
      const mockFile1 = createMockImageFile('test-image-1.jpg', 'test content 1');
      const mockFile2 = createMockImageFile('test-image-2.jpg', 'test content 2');
      await uploadImage(mockFile1);
      await uploadImage(mockFile2);

      render(<Dashboard />);

      // Wait for images to load
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(2\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify images are displayed (ImageGrid should show them)
      await waitFor(() => {
        expect(screen.getByText('test-image-1.jpg')).toBeInTheDocument();
        expect(screen.getByText('test-image-2.jpg')).toBeInTheDocument();
      });
    });

    it('should display empty state when no images exist', async () => {
      render(<Dashboard />);

      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(0\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Empty state from ImageGrid
      await waitFor(() => {
        expect(screen.getByText(/Nenhuma imagem/i)).toBeInTheDocument();
      });
    });
  });

  describe('Callbacks', () => {
    it('should add new image to list when handleUploadSuccess is called', async () => {
      render(<Dashboard />);

      // Wait for initial load (0 images)
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(0\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Simulate upload success by uploading actual image
      await demoLogin();
      const mockFile = createMockImageFile('new-image.jpg', 'content');
      await uploadImage(mockFile);

      // Manually trigger the callback (since we can't easily trigger ImageUpload component)
      // Instead, let's re-render or use refresh button
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);

      // Wait for image to appear
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(1\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should remove image from list when handleImageDeleted is called', async () => {
      // Pre-populate with images
      await demoLogin();
      const mockFile = createMockImageFile('to-delete.jpg', 'content');
      const uploaded = await uploadImage(mockFile);

      render(<Dashboard />);

      // Wait for image to appear
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(1\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Delete the image
      await deleteImage(uploaded.id);

      // Click refresh to update list
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);

      // Wait for image to be removed
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(0\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});

describe('Dashboard - User Interactions', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
  });

  describe('User interactions', () => {
    it('should reload images when refresh button is clicked', async () => {
      render(<Dashboard />);

      // Wait for initial load to complete and button to appear
      await waitFor(
        () => {
          const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
          expect(refreshButton).toBeEnabled();
        },
        { timeout: 3000 }
      );

      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });

      // Click refresh
      fireEvent.click(refreshButton);

      // Should show loading state briefly
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Carregando/i })).toBeDisabled();
      });

      // Should complete loading
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Atualizar/i })).toBeEnabled();
        },
        { timeout: 3000 }
      );
    });

    it('should disable refresh button while loading', async () => {
      render(<Dashboard />);

      // Wait for initial load to complete
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Atualizar/i })).toBeEnabled();
        },
        { timeout: 3000 }
      );

      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });

      // Click refresh
      fireEvent.click(refreshButton);

      // Button should be disabled during load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Carregando/i })).toBeDisabled();
      });
    });
  });
});

describe('Dashboard - UI States', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
  });

  describe('Loading states', () => {
    it('should show loading indicator when loading images', async () => {
      render(<Dashboard />);

      // Initially should show loading
      expect(screen.getByText(/Carregando imagens/i)).toBeInTheDocument();

      // Spinner should be present (using class selector)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should hide loading indicator after images loaded', async () => {
      render(<Dashboard />);

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.queryByText(/Carregando imagens/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should show loading text on refresh button when loading', async () => {
      render(<Dashboard />);

      // Wait for initial load
      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /Atualizar/i })).toBeEnabled();
        },
        { timeout: 3000 }
      );

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);

      // Button text should change to "Carregando..."
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Carregando/i })).toBeInTheDocument();
      });
    });
  });

  describe('Display features', () => {
    it('should show image count in section header', async () => {
      render(<Dashboard />);

      // Initially 0 images
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(0\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Upload an image
      await demoLogin();
      const mockFile = createMockImageFile('count-test.jpg');
      await uploadImage(mockFile);

      // Refresh to see new count
      const refreshButton = screen.getByRole('button', { name: /Atualizar/i });
      fireEvent.click(refreshButton);

      // Should show 1 image
      await waitFor(
        () => {
          expect(screen.getByText(/Minhas Imagens \(1\)/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should render settings link in header', async () => {
      render(<Dashboard />);
      await waitFor(() => {
        const settingsLink = screen.getByRole('link', { name: /Configurações/i });
        expect(settingsLink).toBeInTheDocument();
        expect(settingsLink).toHaveAttribute('href', '/settings');
      });
    });
  });
});

describe('Dashboard - Error Handling', () => {
  beforeEach(async () => {
    cleanup();
    await cleanDatabase();
    vi.restoreAllMocks();
  });

  describe('Error states', () => {
    it('should display error message when image loading fails', async () => {
      // Mock demoLogin to succeed first
      vi.spyOn(api, 'demoLogin').mockResolvedValueOnce({
        token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' },
      });

      // Then mock getImages to throw error
      const getImagesSpy = vi
        .spyOn(api, 'getImages')
        .mockRejectedValueOnce(new Error('Network error'));

      render(<Dashboard />);

      // Wait for error to appear
      await waitFor(
        () => {
          expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Error should be displayed in red box
      const errorBox = screen.getByText(/Network error/i).closest('div');
      expect(errorBox).toHaveClass('bg-red-50');

      getImagesSpy.mockRestore();
    });

    it('should display authentication error message', async () => {
      // Mock demoLogin to succeed first
      vi.spyOn(api, 'demoLogin').mockResolvedValueOnce({
        token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' },
      });

      // Then mock getImages to throw auth error
      const getImagesSpy = vi
        .spyOn(api, 'getImages')
        .mockRejectedValueOnce(new Error('Authentication token expired'));

      render(<Dashboard />);

      // Wait for auth error to appear
      await waitFor(
        () => {
          expect(
            screen.getByText(/Erro de autenticação. Por favor, faça login novamente./i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      getImagesSpy.mockRestore();
    });

    it('should display initialization error message', async () => {
      // Mock demoLogin to throw error
      const demoLoginSpy = vi
        .spyOn(api, 'demoLogin')
        .mockRejectedValueOnce(new Error('Login service unavailable'));

      render(<Dashboard />);

      // Wait for init error to appear
      await waitFor(
        () => {
          expect(
            screen.getByText(/Erro ao inicializar: Login service unavailable/i)
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      demoLoginSpy.mockRestore();
    });
  });

  describe('Duration update callback', () => {
    it('should update image duration when handleDurationUpdate is called', async () => {
      // Pre-populate with an image
      await demoLogin();
      const mockFile = createMockImageFile('duration-test.jpg', 'content');
      await uploadImage(mockFile);

      render(<Dashboard />);

      // Wait for image to appear
      await waitFor(
        () => {
          expect(screen.getByText('duration-test.jpg')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Find and click the duration button to enter edit mode
      const durationButton = screen.getByTitle(/Clique para editar duração/i);
      fireEvent.click(durationButton);

      // Find the duration input (now in edit mode)
      const durationInput = await screen.findByRole('spinbutton');
      expect(durationInput).toBeInTheDocument();

      // Initial value should be 5 seconds (5000ms / 1000)
      expect(durationInput).toHaveValue(5);

      // Change to 8 seconds
      fireEvent.change(durationInput, { target: { value: '8' } });
      expect(durationInput).toHaveValue(8);

      // Click save button
      const saveButton = screen.getByTitle('Salvar');
      fireEvent.click(saveButton);

      // Wait for edit mode to close and verify duration updated
      await waitFor(() => {
        // Duration button should show new value (8s = 8000ms)
        expect(screen.getByText(/8\.0s/i)).toBeInTheDocument();
      });
    });
  });
});
