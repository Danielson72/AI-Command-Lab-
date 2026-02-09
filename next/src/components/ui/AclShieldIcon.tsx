'use client';

import React from 'react';

interface AclShieldIconProps {
  size?: number;
  className?: string;
  variant?: 'sidebar' | 'login' | 'favicon';
}

export default function AclShieldIcon({ 
  size = 24, 
  className = '',
  variant = 'sidebar' 
}: AclShieldIconProps) {
  if (variant === 'login') {
    return (
      <svg
        width={size}
        height={size * 1.17}
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="AI Command Lab Shield"
      >
        <defs>
          {/* Metallic silver-to-steel gradient for shield body */}
          <linearGradient id="shield-metal-login" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="25%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#A8A8A8" />
            <stop offset="75%" stopColor="#B8B8B8" />
            <stop offset="100%" stopColor="#808080" />
          </linearGradient>
          {/* Gold accent gradient */}
          <linearGradient id="shield-gold-login" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5D06C" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8941F" />
          </linearGradient>
          {/* Blue center glow */}
          <radialGradient id="shield-blue-login" cx="50%" cy="45%" r="25%">
            <stop offset="0%" stopColor="#4DA3FF" />
            <stop offset="70%" stopColor="#0070F3" />
            <stop offset="100%" stopColor="#004BB5" />
          </radialGradient>
          {/* Drop shadow */}
          <filter id="shield-glow-login" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#0070F3" floodOpacity="0.4"/>
          </filter>
        </defs>
        {/* Shield body */}
        <path
          d="M60 8 L108 28 L108 75 C108 100 88 120 60 134 C32 120 12 100 12 75 L12 28 Z"
          fill="url(#shield-metal-login)"
          stroke="url(#shield-gold-login)"
          strokeWidth="3"
          filter="url(#shield-glow-login)"
        />
        {/* Inner shield border */}
        <path
          d="M60 18 L100 35 L100 74 C100 95 83 112 60 125 C37 112 20 95 20 74 L20 35 Z"
          fill="none"
          stroke="url(#shield-gold-login)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Blue core orb */}
        <circle cx="60" cy="62" r="22" fill="url(#shield-blue-login)" />
        {/* Light reflection on orb */}
        <ellipse cx="53" cy="54" rx="8" ry="5" fill="white" opacity="0.3" />
        {/* ACL text */}
        <text
          x="60" y="68"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontFamily="Outfit, sans-serif"
          fontWeight="700"
          letterSpacing="2"
        >ACL</text>
      </svg>
    );
  }

  // Sidebar & favicon variant — minimal shield outline with blue dot
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ACL"
    >
      {/* Shield outline - adapts to theme via currentColor */}
      <path
        d="M12 2 L21 6.5 L21 12 C21 17.5 17 22 12 23.5 C7 22 3 17.5 3 12 L3 6.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
      {/* Blue center dot */}
      <circle cx="12" cy="11.5" r="3.5" fill="#0070F3" />
      {/* Subtle light reflection */}
      <circle cx="11" cy="10.5" r="1" fill="white" opacity="0.4" />
    </svg>
  );
}
