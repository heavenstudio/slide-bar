import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { createInterval, clearIntervalTimer } from '../lib/timers';
import type { Image } from '../types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
interface ErrorStateProps {
  error: string;
}

function ErrorState({ error }: ErrorStateProps) {
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
interface SlideshowUIProps {
  currentImage: Image;
  currentIndex: number;
  imagesCount: number;
  isPaused: boolean;
  progress: number;
}

function SlideshowUI({
  currentImage,
  currentIndex,
  imagesCount,
  isPaused,
  progress,
}: SlideshowUIProps) {
  return (
    <div className="fixed inset-0 bg-black">
      {currentImage && (
        <img
          key={currentImage.id}
          src={currentImage.url}
          alt={currentImage.filename}
          className="w-full h-full object-contain"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
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
interface UseImageLoaderReturn {
  images: Image[];
  isLoading: boolean;
  error: string | null;
}

function useImageLoader(
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
): UseImageLoaderReturn {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentIndex]);

  useEffect(() => {
    loadImages();
    const channel: RealtimeChannel = supabase
      .channel('images-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'images' }, (payload) => {
        console.warn('Realtime event received:', payload.eventType);
        loadImages();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadImages]);

  return { images, isLoading, error };
}

/**
 * Custom hook for keyboard controls
 */
function useKeyboardControls(
  imagesLength: number,
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
): void {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const { images, isLoading, error } = useImageLoader(setCurrentIndex);

  // Get current image's display duration, fallback to 5000ms if not set
  const currentDuration = images[currentIndex]?.display_duration ?? 5000;

  // Progress bar animation - updates every 50ms to show smooth progress
  useEffect(() => {
    if (images.length === 0 || isPaused) return;

    setProgress(0); // Reset progress when image changes or unpauses
    const startTime = Date.now();

    const progressTimer = createInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / currentDuration) * 100, 100);
      setProgress(newProgress);
    }, 50);

    return () => clearIntervalTimer(progressTimer);
  }, [currentIndex, isPaused, currentDuration, images.length]);

  // Main slideshow timer - advances to next image
  useEffect(() => {
    if (images.length === 0 || isPaused) return;
    const timer: NodeJS.Timeout = createInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      currentDuration
    );
    return () => clearIntervalTimer(timer);
  }, [images.length, isPaused, currentDuration, currentIndex]);

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
      progress={progress}
    />
  );
}
