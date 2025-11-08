import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Player from '../../src/pages/Player';

// Mock fetch
global.fetch = vi.fn();

describe('Player', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show loading state initially', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Player />);

    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
  });

  it('should fetch and display images', async () => {
    const mockImages = [
      {
        id: 1,
        filename: 'test1.jpg',
        url: '/uploads/test1.jpg',
        createdAt: new Date(),
      },
      {
        id: 2,
        filename: 'test2.jpg',
        url: '/uploads/test2.jpg',
        createdAt: new Date(),
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByAltText('test1.jpg')).toBeInTheDocument();
    });

    // Should show slide counter
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should show empty state when no images exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: [] }),
    });

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma imagem disponível/i)).toBeInTheDocument();
    });
  });

  it('should show error state on fetch failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    });

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
        createdAt: new Date(),
      },
      {
        id: 2,
        filename: 'test2.jpg',
        url: '/uploads/test2.jpg',
        createdAt: new Date(),
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

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
        createdAt: new Date(),
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: mockImages }),
    });

    render(<Player />);

    await waitFor(() => {
      expect(screen.getByText(/Espaço: Pausar\/Continuar/i)).toBeInTheDocument();
    });
  });

  it('should call API without authentication', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ images: [] }),
    });

    render(<Player />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/player/images');
    });

    // Verify no Authorization header was sent
    const fetchCall = global.fetch.mock.calls[0];
    expect(fetchCall[1]).toBeUndefined(); // No options object with headers
  });
});
