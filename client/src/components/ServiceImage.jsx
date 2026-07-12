import React, { useState } from 'react';
import { getServiceImage, getFallbackImage } from '../utils/imageHelpers';

const ServiceImage = ({ serviceId, alt, style, className }) => {
  const [retries, setRetries] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const maxRetries = 2; // Reduced to 2 so it falls back faster to the robust Unsplash images

  const handleError = () => {
    if (retries < maxRetries) {
      setTimeout(() => {
        setRetries(r => r + 1);
      }, 500 + (Math.random() * 1000));
    } else {
      setUseFallback(true);
    }
  };

  const currentSrc = useFallback 
    ? getFallbackImage(serviceId) 
    : (() => {
        let src = getServiceImage(serviceId);
        if (retries > 0 && !src.startsWith('/')) {
          src += (src.includes('?') ? '&' : '?') + `retry=${retries}`;
        }
        return src;
      })();

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={style}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
};

export default ServiceImage;
