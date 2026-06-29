import { useEffect, useRef, useState } from 'react';

export default function SliceImage({ src, alt, className, style, onReady }) {
  const [displaySrc, setDisplaySrc] = useState(src || null);
  const [isLoading, setIsLoading] = useState(false);
  const pendingSrcRef = useRef(src || null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      pendingSrcRef.current = null;
      setDisplaySrc(null);
      setIsLoading(false);
      return undefined;
    }

    if (src === displaySrc) {
      setIsLoading(false);
      return undefined;
    }

    pendingSrcRef.current = src;
    setIsLoading(true);

    const loader = new Image();
    loader.decoding = 'async';

    const commitLoadedImage = () => {
      if (pendingSrcRef.current !== src) return;
      setDisplaySrc(src);
      setIsLoading(false);
    };

    loader.onload = commitLoadedImage;
    loader.onerror = () => {
      if (pendingSrcRef.current !== src) return;
      setIsLoading(false);
    };
    loader.src = src;

    if (loader.complete) {
      commitLoadedImage();
    }

    return () => {
      loader.onload = null;
      loader.onerror = null;
    };
  }, [src, displaySrc]);

  const handleImageLoad = () => {
    if (imgRef.current && onReady) {
      onReady(imgRef.current);
    }
  };

  if (!displaySrc) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <img
        ref={imgRef}
        src={displaySrc}
        alt={alt}
        className={className}
        style={style}
        draggable={false}
        onLoad={handleImageLoad}
      />
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/35">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </>
  );
}
