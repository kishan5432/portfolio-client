import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  priority = false,
  sizes,
  quality = 75,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Generate responsive srcSet for different screen sizes
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('cloudinary.com') && !baseSrc.includes('unsplash.com')) {
      return undefined;
    }

    const sizes = [400, 800, 1200, 1600];
    return sizes
      .map(size => {
        if (baseSrc.includes('cloudinary.com')) {
          return `${baseSrc.replace('/upload/', `/upload/w_${size},q_${quality},f_auto/`)} ${size}w`;
        }
        if (baseSrc.includes('unsplash.com')) {
          return `${baseSrc}&w=${size}&q=${quality} ${size}w`;
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
  };

  // Generate blur placeholder
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;

    // Simple blur placeholder using a tiny image
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=';
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') return;

    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the image when it comes into view
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, [priority, loading]);

  const aspectRatio = width && height ? height / width : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: aspectRatio ? `${width} / ${height}` : undefined,
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <motion.div
          className="absolute inset-0 bg-muted"
          style={{
            backgroundImage: `url(${generateBlurDataURL()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
        />
      )}

      {/* Main image */}
      <motion.img
        ref={imgRef}
        src={priority || loading === 'eager' ? currentSrc : undefined}
        data-src={priority || loading === 'eager' ? undefined : currentSrc}
        alt={alt}
        width={width}
        height={height}
        srcSet={generateSrcSet(currentSrc)}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        loading={priority ? 'eager' : loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          objectFit,
          objectPosition: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
      />

      {/* Error fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Loading spinner */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <motion.div
            className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: shouldReduceMotion ? 0.01 : 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Gallery image component with accessibility features
interface GalleryImageProps extends OptimizedImageProps {
  caption?: string;
  index: number;
  total: number;
  onClick?: () => void;
}

export function GalleryImage({
  caption,
  index,
  total,
  onClick,
  alt,
  ...imageProps
}: GalleryImageProps) {
  return (
    <motion.div
      className="group cursor-pointer focus-within:ring-2 focus-within:ring-accent rounded-lg overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none"
        aria-label={`${alt}. Image ${index + 1} of ${total}${caption ? `. ${caption}` : ''}`}
      >
        <OptimizedImage
          {...imageProps}
          alt={alt}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {caption && (
          <div className="p-3 bg-card">
            <p className="text-sm text-muted-foreground">{caption}</p>
          </div>
        )}
      </button>
    </motion.div>
  );
}

// Avatar component with fallback
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  if (!src) {
    return (
      <div
        className={`
          ${sizes[size]} ${className}
          rounded-full bg-muted flex items-center justify-center
          text-muted-foreground font-medium
        `}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      className={`${sizes[size]} ${className} rounded-full`}
      objectFit="cover"
      priority={size === 'xl'}
    />
  );
}
