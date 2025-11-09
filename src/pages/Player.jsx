import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
        <p className="mt-4 text-white text-xl">Carregando...</p>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ error }) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Erro</h1>
        <p className="text-xl">{error}</p>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
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

/**
 * Slideshow UI with overlays
 */
function SlideshowUI({ currentImage, currentIndex, imagesCount, isPaused }) {
  return (
    <div className="fixed inset-0 bg-black">
      <img
        key={currentImage.id}
        src={currentImage.url}
        alt={currentImage.filename}
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${((currentIndex + 1) / imagesCount) * 100}%` }}
        />
      </div>
      {isPaused && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
          ⏸ Pausado
        </div>
      )}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {currentIndex + 1} / {imagesCount}
      </div>
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm animate-fade-out">
        <div>Espaço: Pausar/Continuar</div>
        <div>← →: Navegar</div>
      </div>
    </div>
  );
}

/**
 * Custom hook for loading images with realtime subscription
 */
function useImageLoader(setCurrentIndex) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw new Error(fetchError.message);
      const newImages = data || [];
      setImages(newImages);
      setCurrentIndex((prev) =>
        newImages.length === 0 ? 0 : prev >= newImages.length ? newImages.length - 1 : prev
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentIndex]);

  useEffect(() => {
    loadImages();
    const channel = supabase
      .channel('images-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'images' }, (payload) => {
        console.warn('Realtime event received:', payload.eventType);
        loadImages();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadImages]);

  return { images, isLoading, error };
}

/**
 * Custom hook for keyboard controls
 */
function useKeyboardControls(imagesLength, setIsPaused, setCurrentIndex) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') setIsPaused((prev) => !prev);
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % imagesLength);
      if (e.key === 'ArrowLeft')
        setCurrentIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [imagesLength, setIsPaused, setCurrentIndex]);
}

/**
 * Player Page
 * Public-facing fullscreen slideshow player for displaying images on TV/monitors
 */
export default function Player() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDuration] = useState(5000);

  const { images, isLoading, error } = useImageLoader(setCurrentIndex);

  useEffect(() => {
    if (images.length === 0 || isPaused) return;
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      slideDuration
    );
    return () => clearInterval(timer);
  }, [images.length, isPaused, slideDuration]);

  useKeyboardControls(images.length, setIsPaused, setCurrentIndex);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (images.length === 0) return <EmptyState />;

  return (
    <SlideshowUI
      currentImage={images[currentIndex]}
      currentIndex={currentIndex}
      imagesCount={images.length}
      isPaused={isPaused}
    />
  );
}
