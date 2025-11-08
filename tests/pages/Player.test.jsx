import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Player from '../../src/pages/Player';
import {
  useSupabaseCleanup,
  cleanDatabase,
  createMockImageFile,
} from '../helpers/supabase.js';
import { demoLogin, uploadImage } from '../../src/lib/supabaseApi.js';

// Setup automatic database cleanup after each test
useSupabaseCleanup();

describe('Player', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should fetch and display images', async () => {
    // Login and upload test images
    await demoLogin();

    const mockFile1 = createMockImageFile('test1.jpg', 'test content 1');
    const mockFile2 = createMockImageFile('test2.jpg', 'test content 2');

    await uploadImage(mockFile1);
    await uploadImage(mockFile2);

    render(<Player />);

    // Wait for images to load (check for either image since order may vary)
    await waitFor(() => {
      const img1 = screen.queryByAltText('test1.jpg');
      const img2 = screen.queryByAltText('test2.jpg');
      expect(img1 || img2).toBeTruthy();
    });

    // Should show slide counter
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should show empty state when no images exist', async () => {
    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma imagem disponível/i)).toBeInTheDocument();
    });
  });

  it('should display slide counter', async () => {
    // Login and upload test images
    await demoLogin();

    const mockFile1 = createMockImageFile('test1.jpg');
    const mockFile2 = createMockImageFile('test2.jpg');

    await uploadImage(mockFile1);
    await uploadImage(mockFile2);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('should render keyboard controls hint', async () => {
    // Login and upload at least one image so controls are visible
    await demoLogin();
    const mockFile = createMockImageFile('test1.jpg');
    await uploadImage(mockFile);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Espaço: Pausar\/Continuar/i)).toBeInTheDocument();
    });
  });
});
