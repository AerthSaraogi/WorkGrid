import React from 'react';

export interface LogoProps {
  size?: number;
  className?: string;
}

export const WorkGridLogo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="comp-wg-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2034" />
          <stop offset="100%" stopColor="#0b0c14" />
        </linearGradient>
        <linearGradient id="comp-wg-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#comp-wg-bg)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
      <rect x="6.5" y="6.5" width="8" height="8" rx="2.5" fill="url(#comp-wg-accent)" />
      <rect x="17.5" y="6.5" width="8" height="8" rx="2.5" fill="#4f46e5" fillOpacity="0.9" />
      <rect x="6.5" y="17.5" width="8" height="8" rx="2.5" fill="#6366f1" fillOpacity="0.8" />
      <rect x="17.5" y="17.5" width="8" height="8" rx="2.5" fill="url(#comp-wg-accent)" />
      <circle cx="16" cy="16" r="1.5" fill="#ffffff" fillOpacity="0.95" />
    </svg>
  );
};
