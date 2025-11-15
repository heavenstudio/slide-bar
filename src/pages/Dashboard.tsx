import { useState, useEffect } from 'react';
import ImageUpload from '../components/upload/ImageUpload';
import ImageGrid from '../components/upload/ImageGrid';
import { getImages, demoLogin } from '../lib/api';
import { Image } from '../types/database';

/**
 * Dashboard header with title, settings, and player links
 */
function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Slide Bar</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie suas imagens para painéis digitais
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/settings"
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configurações
            </a>
            <a
              href="/player"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Abrir Player
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

interface UploadSectionProps {
  isAuthenticating: boolean;
  onUploadSuccess: (image: Image) => void;
}

/**
 * Upload section component
 */
function UploadSection({ isAuthenticating, onUploadSuccess }: UploadSectionProps) {
  if (isAuthenticating) return null;
  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Enviar Nova Imagem</h2>
      <ImageUpload onUploadSuccess={onUploadSuccess} />
    </section>
  );
}

interface ImagesSectionProps {
  images: Image[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onImageDeleted: (id: string) => void;
  onImageUpdated: (id: string, newDuration: number) => void;
}

/**
 * Images section with grid and controls
 */
function ImagesSection({
  images,
  isLoading,
  error,
  onRefresh,
  onImageDeleted,
  onImageUpdated,
}: ImagesSectionProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Minhas Imagens ({images.length})</h2>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isLoading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {isLoading && images.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando imagens...</p>
        </div>
      ) : (
        <ImageGrid
          images={images}
          onImageDeleted={onImageDeleted}
          onImageUpdated={onImageUpdated}
        />
      )}
    </section>
  );
}

interface UseImageLoaderReturn {
  images: Image[];
  setImages: React.Dispatch<React.SetStateAction<Image[]>>;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  loadImages: () => Promise<void>;
}

/**
 * Custom hook for loading images with authentication
 */
function useImageLoader(): UseImageLoaderReturn {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getImages();
      setImages(data.images || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const authError = errorMessage.includes('Authentication') || errorMessage.includes('token');
      setError(authError ? 'Erro de autenticação. Por favor, faça login novamente.' : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setIsAuthenticating(true);
        setError(null);
        await demoLogin();
        setIsAuthenticating(false);
        await loadImages();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError('Erro ao inicializar: ' + errorMessage);
        setIsLoading(false);
        setIsAuthenticating(false);
      }
    };
    init();
  }, []);

  return { images, setImages, isLoading, isAuthenticating, error, loadImages };
}

/**
 * Dashboard Page
 * Main page for managing uploaded images
 */
export default function Dashboard() {
  const { images, setImages, isLoading, isAuthenticating, error, loadImages } = useImageLoader();

  const handleUpload = (img: Image): void => setImages((prev) => [img, ...prev]);
  const handleDelete = (id: string): void =>
    setImages((prev) => prev.filter((img) => img.id !== id));
  const handleDurationUpdate = (id: string, newDuration: number): void =>
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, display_duration: newDuration } : img))
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadSection isAuthenticating={isAuthenticating} onUploadSuccess={handleUpload} />
        <ImagesSection
          images={images}
          isLoading={isLoading}
          error={error}
          onRefresh={loadImages}
          onImageDeleted={handleDelete}
          onImageUpdated={handleDurationUpdate}
        />
      </main>
    </div>
  );
}
