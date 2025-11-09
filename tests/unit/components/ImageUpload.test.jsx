import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { act } from 'react';

// Mock the Supabase API module
vi.mock('../../../src/lib/supabaseApi', () => ({
  uploadImage: vi.fn(),
}));

import ImageUpload from '../../../src/components/upload/ImageUpload';
import { uploadImage } from '../../../src/lib/supabaseApi';

/**
 * ImageUpload Component Tests
 *
 * Testing approach: TDD (Test-Driven Development)
 * Coverage target: 100%
 *
 * Test categories:
 * 1. Basic rendering
 * 2. File selection (click)
 * 3. Drag and drop
 * 4. File validation
 * 5. Upload states
 * 6. Error handling
 * 7. Success callbacks
 */
describe('ImageUpload', () => {
  beforeEach(() => {
    cleanup(); // Clean up DOM from previous tests
    vi.clearAllMocks();
  });

  // ======================
  // 1. Basic Rendering Tests
  // ======================

  it('should render upload area', () => {
    render(<ImageUpload />);

    expect(screen.getByText(/Clique para selecionar/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG ou JPEG/i)).toBeInTheDocument();
  });

  it('should accept only JPEG and PNG files', () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');

    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png');
  });

  // ======================
  // 2. File Selection Tests
  // ======================

  it('should open file selector when clicked', () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');
    fireEvent.click(uploadArea);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should upload file when selected via file input', async () => {
    uploadImage.mockResolvedValue({ id: '1', url: '/test.jpg' });

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file);
    });
  });

  // ======================
  // 3. Drag and Drop Tests
  // ======================

  it('should highlight drop area when dragging over', () => {
    render(<ImageUpload />);

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');

    // Initially should not have dragging styles
    expect(uploadArea).not.toHaveClass('border-blue-500');
    expect(uploadArea).not.toHaveClass('bg-blue-50');

    // Drag over
    fireEvent.dragOver(uploadArea);

    // Should have dragging styles
    expect(uploadArea).toHaveClass('border-blue-500');
    expect(uploadArea).toHaveClass('bg-blue-50');
  });

  it('should remove highlight when drag leaves', () => {
    render(<ImageUpload />);

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');

    // Drag over first
    fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('border-blue-500');

    // Drag leave
    fireEvent.dragLeave(uploadArea);

    // Should remove dragging styles
    expect(uploadArea).not.toHaveClass('border-blue-500');
    expect(uploadArea).not.toHaveClass('bg-blue-50');
  });

  it('should upload file when dropped', async () => {
    uploadImage.mockResolvedValue({ id: '1', url: '/test.jpg' });

    render(<ImageUpload />);

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        files: [file],
      },
    };

    fireEvent.drop(uploadArea, dropEvent);

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file);
    });
  });

  it('should remove highlight after drop', async () => {
    uploadImage.mockResolvedValue({ id: '1', url: '/test.jpg' });

    render(<ImageUpload />);

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    // Drag over first
    fireEvent.dragOver(uploadArea);
    expect(uploadArea).toHaveClass('border-blue-500');

    // Drop file - wrapping in act() to handle async state updates
    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        files: [file],
      },
    };

    await act(async () => {
      fireEvent.drop(uploadArea, dropEvent);
    });

    // Should remove dragging styles immediately after drop
    expect(uploadArea).not.toHaveClass('border-blue-500');

    // Wait for upload to complete
    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file);
    });
  });

  // ======================
  // 4. File Validation Tests
  // ======================

  it('should show error for invalid file type', async () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Apenas arquivos JPEG e PNG são permitidos/i)).toBeInTheDocument();
    });

    // Should NOT call uploadImage for invalid file
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it('should show error for file too large', async () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
    const largeContent = 'x'.repeat(11 * 1024 * 1024);
    const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Arquivo muito grande/i)).toBeInTheDocument();
    });

    // Should NOT call uploadImage for invalid file
    expect(uploadImage).not.toHaveBeenCalled();
  });

  // ======================
  // 5. Upload State Tests
  // ======================

  it('should show uploading state', async () => {
    uploadImage.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: '1', url: '/test.jpg' }), 100))
    );

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Enviando imagem/i)).toBeInTheDocument();
    });

    // Spinner should be present
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    // Wait for upload to complete
    await waitFor(
      () => {
        expect(fileInput).not.toBeDisabled();
      },
      { timeout: 200 }
    );
  });

  it('should disable file input during upload', async () => {
    uploadImage.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: '1', url: '/test.jpg' }), 100))
    );

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    // File input should be disabled during upload
    await waitFor(() => {
      expect(fileInput).toBeDisabled();
    });

    // Wait for upload to complete
    await waitFor(
      () => {
        expect(fileInput).not.toBeDisabled();
      },
      { timeout: 200 }
    );
  });

  it('should reset file input after successful upload', async () => {
    uploadImage.mockResolvedValue({ id: '1', url: '/test.jpg' });

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Spy on the value setter
    const valueSetter = vi.fn();
    Object.defineProperty(fileInput, 'value', {
      set: valueSetter,
      get: () => '',
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(valueSetter).toHaveBeenCalledWith('');
    });
  });

  // ======================
  // 6. Error Handling Tests
  // ======================

  it('should display error message when upload fails', async () => {
    const errorMessage = 'Network error occurred';
    uploadImage.mockRejectedValue(new Error(errorMessage));

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should clear previous error when new upload starts', async () => {
    // First upload fails
    uploadImage.mockRejectedValueOnce(new Error('First error'));
    // Second upload succeeds
    uploadImage.mockResolvedValueOnce({ id: '1', url: '/test.jpg' });

    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file1],
      configurable: true,
    });

    fireEvent.change(fileInput);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Upload another file
    const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [file2],
      configurable: true,
    });

    fireEvent.change(fileInput);

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });

  // ======================
  // 7. Success Callback Tests
  // ======================

  it('should call onUploadSuccess callback after successful upload', async () => {
    const mockImageData = { id: '1', url: '/test.jpg', filename: 'test.jpg' };
    uploadImage.mockResolvedValue(mockImageData);

    const onUploadSuccess = vi.fn();
    render(<ImageUpload onUploadSuccess={onUploadSuccess} />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(onUploadSuccess).toHaveBeenCalledWith(mockImageData);
    });
  });

  it('should work without onUploadSuccess callback', async () => {
    uploadImage.mockResolvedValue({ id: '1', url: '/test.jpg' });

    // No onUploadSuccess prop provided
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(uploadImage).toHaveBeenCalledWith(file);
    });

    // Should not throw error when callback is not provided
  });
});
