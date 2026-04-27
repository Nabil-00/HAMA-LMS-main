import React, { memo } from 'react';

type HamaIconVariant = 'default' | 'muted' | 'gold' | 'glow';

interface HamaIconProps {
  size?: 16 | 20 | 24 | 32 | 40 | number;
  variant?: HamaIconVariant;
  className?: string;
  'aria-hidden'?: boolean;
}

const variantClass: Record<HamaIconVariant, string> = {
  default: 'text-[#F5F5DC]',
  muted: 'text-[#A0A0A0]',
  gold: 'text-[#D4AF37]',
  glow: 'text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]'
};

const BaseIcon: React.FC<HamaIconProps & { children: React.ReactNode }> = ({
  size = 24,
  variant = 'default',
  className = '',
  children,
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${variantClass[variant]} ${className}`}
    {...rest}
  >
    {children}
  </svg>
);

export const HamaPlayIcon = memo<HamaIconProps>((props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M10 8.8L16 12L10 15.2V8.8Z" />
  </BaseIcon>
));

export const HamaCoursesIcon = memo<HamaIconProps>((props) => (
  <BaseIcon {...props}>
    <path d="M5.2 7.2C5.2 6.4 5.9 5.8 6.7 5.8H17.3C18.1 5.8 18.8 6.4 18.8 7.2V17.3C18.8 18.1 18.1 18.7 17.3 18.7H6.7C5.9 18.7 5.2 18.1 5.2 17.3V7.2Z" />
    <path d="M8.4 5.8V18.7" />
    <path d="M10.7 9.2H16" />
    <path d="M10.7 12.1H16" />
  </BaseIcon>
));

export const HamaCertificateIcon = memo<HamaIconProps>((props) => (
  <BaseIcon {...props}>
    <path d="M6.1 6.9C6.1 6.1 6.8 5.5 7.6 5.5H16.4C17.2 5.5 17.9 6.1 17.9 6.9V13.2C17.9 14 17.2 14.6 16.4 14.6H12L9.5 17.6L9.1 14.6H7.6C6.8 14.6 6.1 14 6.1 13.2V6.9Z" />
    <path d="M9.2 9.5H14.8" />
    <path d="M9.2 11.8H13.6" />
  </BaseIcon>
));

export const HamaUserIcon = memo<HamaIconProps>((props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="8.2" r="3.1" />
    <path d="M6.4 17.8C7.5 15.7 9.5 14.5 12 14.5C14.5 14.5 16.5 15.7 17.6 17.8" />
  </BaseIcon>
));

export const HamaProgressIcon = memo<HamaIconProps>((props) => (
  <BaseIcon {...props}>
    <path d="M5.5 17.8H18.5" />
    <path d="M6.8 15.6L10.2 12.2L12.8 14.1L17.2 9.6" />
    <circle cx="17.2" cy="9.6" r="1.1" />
  </BaseIcon>
));
