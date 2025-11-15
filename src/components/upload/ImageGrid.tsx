import { useState } from 'react';
import { deleteImage, updateImageDuration } from '../../lib/api';
import type { Image } from '../../types/database';

interface ImageGridProps {
  images: Image[];
  onImageDeleted?: (imageId: string) => void;
  onImageUpdated?: (imageId: string, newDuration: number) => void;
}

interface DeleteButtonProps {
  imageId: string;
  isDeleting: boolean;
  onDelete: (imageId: string) => void;
}

interface ImageCardProps {
  image: Image;
  onDelete: (imageId: string) => void;
  onDurationUpdate: (imageId: string, newDuration: number) => void;
  isDeleting: boolean;
  isSelected: boolean;
  onSelect: (imageId: string) => void;
}

/**
 * Empty state component when no images exist
 */
function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <svg
        className="mx-auto h-16 w-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p>Nenhuma imagem enviada ainda</p>
    </div>
  );
}

/**
 * Delete button component for image card
 */
function DeleteButton({ imageId, isDeleting, onDelete }: DeleteButtonProps) {
  return (
    <button
      onClick={() => onDelete(imageId)}
      disabled={isDeleting}
      data-testid="delete-button"
      aria-label="Deletar imagem"
      className="
        absolute top-2 right-2
        bg-red-500 text-white rounded-full p-2
        opacity-0 group-hover:opacity-100
        transition-opacity
        hover:bg-red-600
        disabled:opacity-50
      "
      title="Deletar imagem"
    >
      {isDeleting ? (
        <span className="block w-4 h-4">...</span>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Individual image card component
 */
function ImageCard({
  image,
  onDelete,
  onDurationUpdate,
  isDeleting,
  isSelected,
  onSelect,
}: ImageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(
    (image.display_duration / 1000).toString()
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const seconds = parseFloat(durationSeconds);
    if (isNaN(seconds) || seconds <= 0) {
      alert('Por favor, insira uma duração válida (maior que 0)');
      return;
    }

    try {
      setIsSaving(true);
      const durationMs = Math.round(seconds * 1000);
      await updateImageDuration(image.id, durationMs);
      onDurationUpdate(image.id, durationMs);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Erro ao atualizar duração: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDurationSeconds((image.display_duration / 1000).toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div
      key={image.id}
      data-testid="image-card"
      className={`relative group rounded-lg overflow-hidden border transition-shadow ${
        isSelected ? 'border-blue-500 border-2 shadow-lg' : 'border-gray-200 hover:shadow-lg'
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(image.id)}
          className="w-5 h-5 cursor-pointer"
          title="Selecionar imagem"
        />
      </div>

      <div className="aspect-square bg-gray-100">
        <img
          src={image.url}
          alt={image.original_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-2 bg-white">
        <p className="text-xs text-gray-600 truncate" title={image.original_name}>
          {image.original_name}
        </p>
        <p className="text-xs text-gray-400">{formatFileSize(image.size)}</p>

        {/* Duration editor */}
        {isEditing ? (
          <div className="flex items-center gap-1 mt-1">
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded"
              disabled={isSaving}
              autoFocus
            />
            <span className="text-xs text-gray-500">s</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              title="Salvar"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-2 py-0.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              title="Cancelar"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors text-left"
            title="Clique para editar duração"
          >
            ⏱ {(image.display_duration / 1000).toFixed(1)}s
          </button>
        )}
      </div>

      <DeleteButton imageId={image.id} isDeleting={isDeleting} onDelete={onDelete} />
    </div>
  );
}

/**
 * Image Grid Component
 * Displays uploaded images in a grid with preview and duration editing
 */
export default function ImageGrid({ images, onImageDeleted, onImageUpdated }: ImageGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchEditor, setShowBatchEditor] = useState(false);
  const [batchDuration, setBatchDuration] = useState('5.0');
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  const handleDelete = async (imageId: string): Promise<void> => {
    if (!window.confirm('Tem certeza que deseja deletar esta imagem?')) {
      return;
    }

    try {
      setDeletingId(imageId);
      await deleteImage(imageId);

      if (onImageDeleted) {
        onImageDeleted(imageId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Erro ao deletar imagem: ' + errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDurationUpdate = (imageId: string, newDuration: number) => {
    if (onImageUpdated) {
      onImageUpdated(imageId, newDuration);
    }
  };

  const handleSelect = (imageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(validImages.map((img) => img.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchSave = async () => {
    const seconds = parseFloat(batchDuration);
    if (isNaN(seconds) || seconds <= 0) {
      alert('Por favor, insira uma duração válida (maior que 0)');
      return;
    }

    try {
      setIsBatchSaving(true);
      const durationMs = Math.round(seconds * 1000);

      // Update all selected images
      await Promise.all(
        Array.from(selectedIds).map((imageId) => updateImageDuration(imageId, durationMs))
      );

      // Update local state for all selected images
      selectedIds.forEach((imageId) => {
        handleDurationUpdate(imageId, durationMs);
      });

      setShowBatchEditor(false);
      setSelectedIds(new Set());
      alert(`Duração atualizada para ${selectedIds.size} imagens`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Erro ao atualizar durações: ' + errorMessage);
    } finally {
      setIsBatchSaving(false);
    }
  };

  const handleBatchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBatchSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowBatchEditor(false);
    }
  };

  if (!images || images.length === 0) {
    return <EmptyState />;
  }

  const validImages = images.filter((image) => image && image.url);
  const selectedCount = selectedIds.size;

  return (
    <div>
      {/* Batch controls */}
      {validImages.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Selecionar Todas
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            disabled={selectedCount === 0}
          >
            Desmarcar Todas
          </button>
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-gray-600">{selectedCount} selecionadas</span>
              <button
                onClick={() => setShowBatchEditor(true)}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Definir Duração em Lote
              </button>
            </>
          )}
        </div>
      )}

      {/* Batch editor modal */}
      {showBatchEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Definir Duração para {selectedCount} Imagens
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={batchDuration}
                onChange={(e) => setBatchDuration(e.target.value)}
                onKeyDown={handleBatchKeyDown}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                disabled={isBatchSaving}
                autoFocus
              />
              <span className="text-gray-600">segundos</span>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowBatchEditor(false)}
                disabled={isBatchSaving}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchSave}
                disabled={isBatchSaving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isBatchSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validImages.map((image) => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={handleDelete}
            onDurationUpdate={handleDurationUpdate}
            isDeleting={deletingId === image.id}
            isSelected={selectedIds.has(image.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
