import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ImageGrid from '../../../src/components/upload/ImageGrid';
import * as api from '../../../src/lib/api';
import type { Image } from '../../../src/types/database';
import type { DeletionResponse } from '../../../src/lib/supabaseApi';

// Spy on deleteImage instead of mocking the entire module
const deleteImageSpy = vi.spyOn(api, 'deleteImage');

/**
 * ImageGrid Component Tests
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 100%
 *
 * Test categories:
 * 1. Empty state
 * 2. Image rendering
 * 3. File size formatting
 * 4. Delete functionality
 * 5. Edge cases
 */

describe('ImageGrid - Empty State', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should show empty state when no images', () => {
    render(<ImageGrid images={[]} />);

    expect(screen.getByText(/Nenhuma imagem enviada ainda/i)).toBeInTheDocument();
  });

  it('should show empty state when images is null', () => {
    render(<ImageGrid images={null as unknown as Image[]} />);

    expect(screen.getByText(/Nenhuma imagem enviada ainda/i)).toBeInTheDocument();
  });

  it('should show empty state when images is undefined', () => {
    render(<ImageGrid images={undefined as unknown as Image[]} />);

    expect(screen.getByText(/Nenhuma imagem enviada ainda/i)).toBeInTheDocument();
  });
});

describe('ImageGrid - Image Rendering', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should render images in grid', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test1.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 50000,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
      {
        id: '2',
        url: '/uploads/image2.png',
        original_name: 'test2.png',
        filename: 'image2.png',
        path: '/uploads/image2.png',
        mime_type: 'image/png',
        size: 75000,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.png')).toBeInTheDocument();
  });

  it('should filter out images with null URLs', () => {
    const mockImages = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test1.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 50000,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
      {
        id: '2',
        url: null as unknown as string, // Should be filtered out
        original_name: 'test2.png',
        filename: 'image2.png',
        path: '/uploads/image2.png',
        mime_type: 'image/png',
        size: 75000,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ] as Image[];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.queryByText('test2.png')).not.toBeInTheDocument();
  });

  it('should render delete button for each image', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test1.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 50000,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    const deleteButtons = screen.getAllByTestId('delete-button');
    expect(deleteButtons).toHaveLength(1);
  });
});

describe('ImageGrid - File Size Formatting', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should display file sizes in human-readable format', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024, // 1 KB
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/1 KB/i)).toBeInTheDocument();
  });

  it('should format bytes correctly', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 512, // 512 Bytes
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/512 Bytes/i)).toBeInTheDocument();
  });

  it('should format megabytes correctly', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1048576, // 1 MB
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
  });

  it('should format zero bytes correctly', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 0,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/0 Bytes/i)).toBeInTheDocument();
  });
});

describe('ImageGrid - Delete Functionality', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should show confirmation dialog when delete button clicked', () => {
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja deletar esta imagem?');
  });

  it('should call deleteImage API when confirmed', async () => {
    deleteImageSpy.mockResolvedValue({ success: true });
    const mockOnImageDeleted = vi.fn();
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} onImageDeleted={mockOnImageDeleted} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteImageSpy).toHaveBeenCalledWith('1');
    });
  });

  it('should call onImageDeleted callback after successful deletion', async () => {
    deleteImageSpy.mockResolvedValue({ success: true });
    const mockOnImageDeleted = vi.fn();
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} onImageDeleted={mockOnImageDeleted} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnImageDeleted).toHaveBeenCalledWith('1');
    });
  });

  it('should not delete image when confirmation is cancelled', async () => {
    window.confirm = vi.fn(() => false); // User clicks "Cancel"
    const mockOnImageDeleted = vi.fn();
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} onImageDeleted={mockOnImageDeleted} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Wait a bit to ensure nothing happens
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(deleteImageSpy).not.toHaveBeenCalled();
    expect(mockOnImageDeleted).not.toHaveBeenCalled();
  });
});

describe('ImageGrid - Delete Error Handling', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should show error alert when deletion fails', async () => {
    const errorMessage = 'Network error';
    deleteImageSpy.mockRejectedValue(new Error(errorMessage));
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao deletar imagem: ' + errorMessage);
    });
  });

  it('should disable delete button while deletion is in progress', async () => {
    let resolveDelete: (value: DeletionResponse) => void;
    const deletePromise = new Promise<DeletionResponse>((resolve) => {
      resolveDelete = resolve;
    });
    deleteImageSpy.mockReturnValue(deletePromise);

    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Button should be disabled during deletion
    await waitFor(() => {
      expect(deleteButton).toBeDisabled();
    });

    // Complete the deletion
    resolveDelete!({ success: true });

    // Button should be enabled again
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('should show loading indicator when deleting', async () => {
    let resolveDelete: (value: DeletionResponse) => void;
    const deletePromise = new Promise<DeletionResponse>((resolve) => {
      resolveDelete = resolve;
    });
    deleteImageSpy.mockReturnValue(deletePromise);

    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    // Should show "..." loading indicator
    await waitFor(() => {
      expect(deleteButton.textContent).toContain('...');
    });

    // Complete the deletion
    resolveDelete!({ success: true });
  });

  it('should work without onImageDeleted callback', async () => {
    deleteImageSpy.mockResolvedValue({ success: true });
    const mockImages: Image[] = [
      {
        id: '1',
        url: '/uploads/image1.jpg',
        original_name: 'test.jpg',
        filename: 'image1.jpg',
        path: '/uploads/image1.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        organization_id: 'org-1',
        created_at: '2025-11-09T00:00:00Z',
        updated_at: '2025-11-09T00:00:00Z',
      },
    ];

    // No onImageDeleted provided
    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteImageSpy).toHaveBeenCalledWith('1');
    });

    // Should not throw error when callback is not provided
  });
});
