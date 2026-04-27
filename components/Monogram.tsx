import React from 'react';
import BrandLogo from './ui/BrandLogo';

type MonogramSize = 'sm' | 'md' | 'lg';
type MonogramVariant = 'default' | 'glow' | 'subtle';

interface MonogramProps {
  size?: MonogramSize;
  variant?: MonogramVariant;
  clickable?: boolean;
  className?: string;
  alt?: string;
  to?: string;
}

const Monogram: React.FC<MonogramProps> = ({
  size = 'sm',
  variant = 'default',
  clickable = false,
  className = '',
  to = '/'
}) => {
  return (
    <BrandLogo
      variant="icon"
      size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'}
      clickable={clickable}
      href={to}
      subtle={variant === 'subtle'}
      glow={variant === 'glow'}
      className={className}
    />
  );
};

export default Monogram;
