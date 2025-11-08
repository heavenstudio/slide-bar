import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import Player from '../../src/pages/Player';
import { supabase } from '../../src/lib/supabase';

describe('Player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock Supabase to never resolve
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
  });

  it('should fetch and display images', async () => {
    const mockImages = [
      {
        id: 1,
        filename: 'test1.jpg',
        url: '/uploads/test1.jpg',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        filename: 'test2.jpg',
        url: '/uploads/test2.jpg',
        created_at: new Date().toISOString(),
      },
    ];

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByAltText('test1.jpg')).toBeInTheDocument();
    });

    // Should show slide counter
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should show empty state when no images exist', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma imagem disponível/i)).toBeInTheDocument();
    });
  });

  it('should show error state on fetch failure', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' },
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Erro/i)).toBeInTheDocument();
    });
  });

  it('should display slide counter', async () => {
    const mockImages = [
      {
        id: 1,
        filename: 'test1.jpg',
        url: '/uploads/test1.jpg',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        filename: 'test2.jpg',
        url: '/uploads/test2.jpg',
        created_at: new Date().toISOString(),
      },
    ];

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('should render keyboard controls hint', async () => {
    const mockImages = [
      {
        id: 1,
        filename: 'test1.jpg',
        url: '/uploads/test1.jpg',
        created_at: new Date().toISOString(),
      },
    ];

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Espaço: Pausar\/Continuar/i)).toBeInTheDocument();
    });
  });
});
