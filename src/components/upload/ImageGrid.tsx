import { useState } from 'react';
import { deleteImage } from '../../lib/api';
import type { Image } from '../../types/database';

interface ImageGridProps {
  images: Image[];
  onImageDeleted?: (imageId: string) => void;
}

interface DeleteButtonProps {
  imageId: string;
  isDeleting: boolean;
  onDelete: (imageId: string) => void;
}

interface ImageCardProps {
  image: Image;
  onDelete: (imageId: string) => void;
  isDeleting: boolean;
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
function ImageCard({ image, onDelete, isDeleting }: ImageCardProps) {
  return (
    <div
      key={image.id}
      data-testid="image-card"
      className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
    >
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
        <p className="text-xs text-gray-500">⏱ {(image.display_duration / 1000).toFixed(1)}s</p>
      </div>

      <DeleteButton imageId={image.id} isDeleting={isDeleting} onDelete={onDelete} />
    </div>
  );
}

/**
 * Image Grid Component
 * Displays uploaded images in a grid with preview
 */
export default function ImageGrid({ images, onImageDeleted }: ImageGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (!images || images.length === 0) {
    return <EmptyState />;
  }

  const validImages = images.filter((image) => image && image.url);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {validImages.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={handleDelete}
          isDeleting={deletingId === image.id}
        />
      ))}
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
