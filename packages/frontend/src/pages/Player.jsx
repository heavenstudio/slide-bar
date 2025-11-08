import { useState, useEffect, useCallback } from 'react';

/**
 * Player Page
 * Public-facing fullscreen slideshow player for displaying images on TV/monitors
 * No authentication required
 */
export default function Player() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDuration] = useState(5000); // 5 seconds per slide

  // Fetch images from public endpoint
  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/player/images');

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load images on mount
  useEffect(() => {
    loadImages();

    // Refresh images every 5 minutes to get new uploads
    const refreshInterval = setInterval(loadImages, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [loadImages]);

  // Auto-advance slideshow
  useEffect(() => {
    if (images.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [images.length, isPaused, slideDuration]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case ' ':
          setIsPaused((prev) => !prev);
          break;
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev + 1) % images.length);
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [images.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Erro</h1>
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Slide Bar</h1>
          <p className="text-xl">Nenhuma imagem disponível</p>
          <p className="text-sm mt-2 opacity-75">Faça upload de imagens no painel de controle</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black">
      {/* Fullscreen Image */}
      <img
        key={currentImage.id}
        src={currentImage.url}
        alt={currentImage.filename}
        className="w-full h-full object-contain"
      />

      {/* Progress Indicator (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-white transition-all"
          style={{
            width: `${((currentIndex + 1) / images.length) * 100}%`,
          }}
        />
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
          ⏸ Pausado
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Keyboard shortcuts hint (fade out after 5 seconds) */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm animate-fade-out">
        <div>Espaço: Pausar/Continuar</div>
        <div>← →: Navegar</div>
      </div>
    </div>
  );
}
