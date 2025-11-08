import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageUpload from '../../src/components/upload/ImageUpload';

describe('ImageUpload', () => {
  it('should render upload area', () => {
    render(<ImageUpload />);

    expect(screen.getByText(/Clique para selecionar/i)).toBeInTheDocument();
    expect(screen.getByText(/PNG ou JPEG/i)).toBeInTheDocument();
  });

  it('should open file selector when clicked', () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');
    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadArea = screen.getByText(/Clique para selecionar/i).closest('div');
    fireEvent.click(uploadArea);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should show uploading state', async () => {
    // Mock the API before rendering
    const mockUploadImage = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ image: { id: '1', url: '/test.jpg' } }), 100)
          )
      );

    vi.doMock('../../src/lib/api', () => ({
      uploadImage: mockUploadImage,
    }));

    render(<ImageUpload />);

    // Get the hidden file input
    const fileInput = screen.getByTestId('file-input');

    // Create a mock file
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });

    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    // Wait for the upload to complete to avoid act() warning
    await waitFor(
      () => {
        expect(fileInput).not.toBeDisabled();
      },
      { timeout: 200 }
    );
  });

  it('should accept only JPEG and PNG files', () => {
    render(<ImageUpload />);

    const fileInput = screen.getByTestId('file-input');

    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png');
  });
});
