import React from "react";

export default function OptimizedImage({ src, fallback, alt, className }) {
  return (
    <picture>
      <source srcSet={src} type="image/webp" />
      <img
        src={fallback || src.replace(".webp", ".png")}
        alt={alt}
        loading="lazy"
        className={className}
      />
    </picture>
  );
}
