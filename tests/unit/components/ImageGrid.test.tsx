import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ImageGrid from '../../../src/components/upload/ImageGrid';
import * as api from '../../../src/lib/api';
import type { Image } from '../../../src/types/database';
import type { DeletionResponse } from '../../../src/lib/supabaseApi';
import { createMockImage, createMockImages, createMockImageWithSize } from '../../helpers/fixtures';

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
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.jpg')).toBeInTheDocument();
  });

  it('should filter out images with null URLs', () => {
    const mockImages = [
      createMockImage({ id: '1', original_name: 'test1.jpg' }),
      createMockImage({ id: '2', url: null as unknown as string, original_name: 'test2.png' }),
    ] as Image[];

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.queryByText('test2.png')).not.toBeInTheDocument();
  });

  it('should render delete button for each image', () => {
    const mockImages = [createMockImage()];

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
    const mockImages = [createMockImageWithSize(1024)]; // 1 KB

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/1 KB/i)).toBeInTheDocument();
  });

  it('should format bytes correctly', () => {
    const mockImages = [createMockImageWithSize(512)]; // 512 Bytes

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/512 Bytes/i)).toBeInTheDocument();
  });

  it('should format megabytes correctly', () => {
    const mockImages = [createMockImageWithSize(1048576)]; // 1 MB

    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
  });

  it('should format zero bytes correctly', () => {
    const mockImages = [createMockImageWithSize(0)];

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
    const mockImages = [createMockImage()];

    render(<ImageGrid images={mockImages} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja deletar esta imagem?');
  });

  it('should call deleteImage API when confirmed', async () => {
    deleteImageSpy.mockResolvedValue({ success: true });
    const mockOnImageDeleted = vi.fn();
    const mockImages = [createMockImage()];

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
    const mockImages = [createMockImage()];

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
    const mockImages = [createMockImage()];

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
    const mockImages = [createMockImage()];

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

    const mockImages = [createMockImage()];

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

    const mockImages = [createMockImage()];

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
    const mockImages = [createMockImage()];

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

describe('ImageGrid - Duration Editing', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  const updateImageDurationSpy = vi.spyOn(api, 'updateImageDuration');

  it('should display current duration for each image', () => {
    const mockImages = [createMockImage({ display_duration: 5000 })];
    render(<ImageGrid images={mockImages} />);

    expect(screen.getByText('⏱ 5.0s')).toBeInTheDocument();
  });

  it('should enter edit mode when duration button clicked', () => {
    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    const durationButton = screen.getByText(/⏱/);
    fireEvent.click(durationButton);

    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // default duration (toString removes .0)
  });

  it('should allow changing duration value', () => {
    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    const durationButton = screen.getByText(/⏱/);
    fireEvent.click(durationButton);

    const input = screen.getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7.5' } });

    expect(input.value).toBe('7.5');
  });

  it('should save duration when save button clicked', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockOnImageUpdated = vi.fn();
    const mockImages = [createMockImage({ id: 'test-id' })];

    render(<ImageGrid images={mockImages} onImageUpdated={mockOnImageUpdated} />);

    // Enter edit mode
    fireEvent.click(screen.getByText(/⏱/));

    // Change value
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '7.5' } });

    // Click save
    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateImageDurationSpy).toHaveBeenCalledWith('test-id', 7500);
      expect(mockOnImageUpdated).toHaveBeenCalledWith('test-id', 7500);
    });
  });

  it('should cancel editing when cancel button clicked', () => {
    const mockImages = [createMockImage({ display_duration: 5000 })];
    render(<ImageGrid images={mockImages} />);

    // Enter edit mode
    fireEvent.click(screen.getByText(/⏱/));

    // Change value
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '10.0' } });

    // Click cancel
    const cancelButton = screen.getByTitle('Cancelar');
    fireEvent.click(cancelButton);

    // Should exit edit mode and revert to original display
    expect(screen.getByText('⏱ 5.0s')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('10.0')).not.toBeInTheDocument();
  });

  it('should show alert for invalid duration (zero)', async () => {
    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '0' } });

    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Por favor, insira uma duração válida (maior que 0)'
      );
    });
  });

  it('should show alert for invalid duration (negative)', async () => {
    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '-1' } });

    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Por favor, insira uma duração válida (maior que 0)'
      );
    });
  });

  it('should show alert for invalid duration (NaN)', async () => {
    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: 'abc' } });

    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Por favor, insira uma duração válida (maior que 0)'
      );
    });
  });

  it('should show error alert when duration update fails', async () => {
    updateImageDurationSpy.mockRejectedValue(new Error('Update failed'));
    const mockImages = [createMockImage()];

    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '7.5' } });

    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao atualizar duração: Update failed');
    });
  });

  it('should save duration when Enter key is pressed', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockOnImageUpdated = vi.fn();
    const mockImages = [createMockImage({ id: 'test-id' })];

    render(<ImageGrid images={mockImages} onImageUpdated={mockOnImageUpdated} />);

    // Enter edit mode
    fireEvent.click(screen.getByText(/⏱/));

    // Change value
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '8.5' } });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(updateImageDurationSpy).toHaveBeenCalledWith('test-id', 8500);
      expect(mockOnImageUpdated).toHaveBeenCalledWith('test-id', 8500);
    });
  });

  it('should cancel editing when Escape key is pressed', () => {
    const mockImages = [createMockImage({ display_duration: 5000 })];
    render(<ImageGrid images={mockImages} />);

    // Enter edit mode
    fireEvent.click(screen.getByText(/⏱/));

    // Change value
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '10.0' } });

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    // Should exit edit mode and revert to original display
    expect(screen.getByText('⏱ 5.0s')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('10.0')).not.toBeInTheDocument();
  });

  it('should disable inputs while saving duration', async () => {
    let resolveSave: (value: { success: boolean }) => void;
    const savePromise = new Promise<{ success: boolean }>((resolve) => {
      resolveSave = resolve;
    });
    updateImageDurationSpy.mockReturnValue(savePromise);

    const mockImages = [createMockImage()];
    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));
    const input = screen.getByDisplayValue('5') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7.5' } });

    const saveButton = screen.getByTitle('Salvar') as HTMLButtonElement;
    const cancelButton = screen.getByTitle('Cancelar') as HTMLButtonElement;
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(input.disabled).toBe(true);
      expect(saveButton.disabled).toBe(true);
      expect(cancelButton.disabled).toBe(true);
    });

    resolveSave!({ success: true });
  });

  it('should work without onImageUpdated callback', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockImages = [createMockImage()];

    // No onImageUpdated callback provided
    render(<ImageGrid images={mockImages} />);

    fireEvent.click(screen.getByText(/⏱/));
    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '7.5' } });

    const saveButton = screen.getByTitle('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateImageDurationSpy).toHaveBeenCalled();
    });
    // Should not throw error
  });
});

describe('ImageGrid - Selection Functionality', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  it('should render selection checkboxes for each image', () => {
    const mockImages = createMockImages(3);
    render(<ImageGrid images={mockImages} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('should select image when checkbox clicked', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('should deselect image when checkbox clicked again', () => {
    const mockImages = createMockImages(1);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getByRole('checkbox');

    // Select
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Deselect
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should select all images when "Selecionar Todas" clicked', () => {
    const mockImages = createMockImages(3);
    render(<ImageGrid images={mockImages} />);

    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  it('should deselect all images when "Desmarcar Todas" clicked', () => {
    const mockImages = createMockImages(3);
    render(<ImageGrid images={mockImages} />);

    // First select all
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Then deselect all
    const deselectAllButton = screen.getByText('Desmarcar Todas');
    fireEvent.click(deselectAllButton);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should show selected count', () => {
    const mockImages = createMockImages(3);
    render(<ImageGrid images={mockImages} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    expect(screen.getByText('2 selecionadas')).toBeInTheDocument();
  });

  it('should show batch edit button when images selected', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(screen.getByText('Definir Duração em Lote')).toBeInTheDocument();
  });

  it('should disable "Desmarcar Todas" when no images selected', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const deselectAllButton = screen.getByText('Desmarcar Todas') as HTMLButtonElement;
    expect(deselectAllButton.disabled).toBe(true);
  });

  it('should add selected class to selected images', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    const imageCard = screen.getAllByTestId('image-card')[0];

    // Initially not selected
    expect(imageCard.className).not.toContain('border-blue-500');

    // Select image
    fireEvent.click(checkbox);
    expect(imageCard.className).toContain('border-blue-500');
  });
});

describe('ImageGrid - Batch Duration Editor', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    global.window.confirm = vi.fn(() => true);
    global.window.alert = vi.fn();
  });

  const updateImageDurationSpy = vi.spyOn(api, 'updateImageDuration');

  it('should open batch editor modal when batch edit button clicked', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    // Select an image
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    // Click batch edit button
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    expect(screen.getByText(/Definir Duração para 1 Imagens/)).toBeInTheDocument();
  });

  it('should show correct count in batch editor modal', () => {
    const mockImages = createMockImages(3);
    render(<ImageGrid images={mockImages} />);

    // Select all images
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Open batch editor
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    expect(screen.getByText(/Definir Duração para 3 Imagens/)).toBeInTheDocument();
  });

  it('should allow changing batch duration value', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const input = screen.getByDisplayValue('5.0') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10.5' } });

    expect(input.value).toBe('10.5');
  });

  it('should save batch duration for all selected images', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockOnImageUpdated = vi.fn();
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} onImageUpdated={mockOnImageUpdated} />);

    // Select all images
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Open batch editor
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    // Change duration
    const input = screen.getByDisplayValue('5.0');
    fireEvent.change(input, { target: { value: '8.0' } });

    // Save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateImageDurationSpy).toHaveBeenCalledTimes(2);
      expect(mockOnImageUpdated).toHaveBeenCalledTimes(2);
    });
  });

  it('should close modal and show success alert after batch save', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} />);

    // Select all
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Open batch editor
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    // Save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Duração atualizada para 2 imagens');
      expect(screen.queryByText(/Definir Duração para/)).not.toBeInTheDocument();
    });
  });

  it('should clear selection after batch save', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} />);

    // Select all
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Open batch editor
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    // Save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    });
  });

  it('should close batch editor when cancel clicked', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Definir Duração para/)).not.toBeInTheDocument();
  });

  it('should show alert for invalid batch duration (zero)', async () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const input = screen.getByDisplayValue('5.0');
    fireEvent.change(input, { target: { value: '0' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Por favor, insira uma duração válida (maior que 0)'
      );
    });
  });

  it('should show alert for invalid batch duration (negative)', async () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const input = screen.getByDisplayValue('5.0');
    fireEvent.change(input, { target: { value: '-5' } });

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Por favor, insira uma duração válida (maior que 0)'
      );
    });
  });

  it('should show error alert when batch update fails', async () => {
    updateImageDurationSpy.mockRejectedValue(new Error('Batch update failed'));
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erro ao atualizar durações: Batch update failed');
    });
  });

  it('should disable inputs while batch saving', async () => {
    let resolveSave: (value: { success: boolean }) => void;
    const savePromise = new Promise<{ success: boolean }>((resolve) => {
      resolveSave = resolve;
    });
    updateImageDurationSpy.mockReturnValue(savePromise);

    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    const input = screen.getByDisplayValue('5.0') as HTMLInputElement;
    const saveButton = screen.getByText('Salvar') as HTMLButtonElement;
    const cancelButton = screen.getByText('Cancelar') as HTMLButtonElement;

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(input.disabled).toBe(true);
      expect(saveButton.disabled).toBe(true);
      expect(cancelButton.disabled).toBe(true);
      expect(saveButton.textContent).toBe('Salvando...');
    });

    resolveSave!({ success: true });
  });

  it('should save batch duration when Enter key is pressed', async () => {
    updateImageDurationSpy.mockResolvedValue({ success: true });
    const mockImages = createMockImages(2);

    render(<ImageGrid images={mockImages} />);

    // Select all
    const selectAllButton = screen.getByText('Selecionar Todas');
    fireEvent.click(selectAllButton);

    // Open batch editor
    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    // Change value
    const input = screen.getByDisplayValue('5.0');
    fireEvent.change(input, { target: { value: '9.5' } });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(updateImageDurationSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Duração atualizada para 2 imagens');
    });
  });

  it('should close batch editor when Escape key is pressed', () => {
    const mockImages = createMockImages(2);
    render(<ImageGrid images={mockImages} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const batchEditButton = screen.getByText('Definir Duração em Lote');
    fireEvent.click(batchEditButton);

    // Modal should be visible
    expect(screen.getByText(/Definir Duração para/)).toBeInTheDocument();

    const input = screen.getByDisplayValue('5.0');
    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    // Modal should be closed
    expect(screen.queryByText(/Definir Duração para/)).not.toBeInTheDocument();
  });
});
