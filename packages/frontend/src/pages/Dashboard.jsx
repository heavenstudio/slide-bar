import { useState, useEffect } from 'react';
import ImageUpload from '../components/upload/ImageUpload';
import ImageGrid from '../components/upload/ImageGrid';
import { getImages, demoLogin } from '../lib/api';

/**
 * Dashboard Page
 * Main page for managing uploaded images
 */
export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getImages();
      setImages(data.images || []);
    } catch (err) {
      setError(err.message);
      // If it's an auth error, we might need to handle differently
      if (err.message.includes('Authentication') || err.message.includes('token')) {
        setError('Erro de autenticação. Por favor, faça login novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Perform demo login on component mount, then load images
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, login
        await demoLogin();

        // Then, load images
        await loadImages();
      } catch (err) {
        setError('Erro ao inicializar: ' + err.message);
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const handleUploadSuccess = (newImage) => {
    setImages((prev) => [newImage, ...prev]);
  };

  const handleImageDeleted = (imageId) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Slide Bar</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie suas imagens para painéis digitais</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enviar Nova Imagem</h2>
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Images Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Minhas Imagens ({images.length})
            </h2>
            <button
              onClick={loadImages}
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
            <ImageGrid images={images} onImageDeleted={handleImageDeleted} />
          )}
        </section>
      </main>
    </div>
  );
}
