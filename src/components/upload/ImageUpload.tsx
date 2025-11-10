import { useState, useRef } from 'react';
import { uploadImage } from '../../lib/supabaseApi';
import type { Image } from '../../types/database';

/**
 * Component Props Interfaces
 */
interface ImageUploadProps {
  onUploadSuccess?: (imageData: Image) => void;
}

interface ErrorMessageProps {
  error: string | null;
}

interface UploadAreaProps {
  isDragging: boolean;
  isUploading: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Upload area content when uploading
 */
function UploadingState() {
  return (
    <div className="text-gray-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p>Enviando imagem...</p>
    </div>
  );
}

/**
 * Upload area content when idle
 */
function IdleState() {
  return (
    <>
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-2 text-sm text-gray-600">
        <span className="font-semibold">Clique para selecionar</span> ou arraste uma imagem
      </p>
      <p className="mt-1 text-xs text-gray-500">PNG ou JPEG</p>
    </>
  );
}

/**
 * Error message display
 */
function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
}

/**
 * Validates image file type and size
 */
function validateFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Apenas arquivos JPEG e PNG são permitidos');
  }

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
  }

  return true;
}

/**
 * Custom hook for file upload logic
 */
function useFileUpload(
  onUploadSuccess: ((imageData: Image) => void) | undefined,
  fileInputRef: React.RefObject<HTMLInputElement | null>
) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      setError(null);
      setIsUploading(true);
      validateFile(file);
      const imageData = await uploadImage(file);
      if (onUploadSuccess) onUploadSuccess(imageData);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, error, handleFileUpload };
}

/**
 * Upload area with drag-and-drop functionality
 */
function UploadArea({
  isDragging,
  isUploading,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  fileInputRef,
  onFileSelect,
}: UploadAreaProps) {
  return (
    <div
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={onFileSelect}
        className="hidden"
        disabled={isUploading}
        data-testid="file-input"
      />
      {isUploading ? <UploadingState /> : <IdleState />}
    </div>
  );
}

/**
 * Image Upload Component
 * Allows users to upload images via drag-and-drop or file selection
 */
export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, error, handleFileUpload } = useFileUpload(onUploadSuccess, fileInputRef);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFileUpload(files[0]);
  };

  return (
    <div className="w-full">
      <UploadArea
        isDragging={isDragging}
        isUploading={isUploading}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
      />
      <ErrorMessage error={error} />
    </div>
  );
}
