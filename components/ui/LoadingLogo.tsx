import React from 'react';
import BrandLogo from './BrandLogo';

interface LoadingLogoProps {
  className?: string;
}

const LoadingLogo: React.FC<LoadingLogoProps> = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`} role="status" aria-live="polite" aria-label="Loading">
      <BrandLogo variant="icon" size="sm" className="animate-pulse" />
    </div>
  );
};

export default LoadingLogo;
