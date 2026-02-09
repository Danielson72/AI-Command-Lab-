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
          {/* Chrome metallic bevel gradient - outer highlight */}
          <linearGradient id="shield-chrome-outer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0F0F0" />
            <stop offset="15%" stopColor="#E0E0E0" />
            <stop offset="30%" stopColor="#C8C8C8" />
            <stop offset="50%" stopColor="#A0A0A0" />
            <stop offset="70%" stopColor="#888888" />
            <stop offset="85%" stopColor="#606060" />
            <stop offset="100%" stopColor="#404040" />
          </linearGradient>
          {/* Chrome metallic bevel gradient - inner edge */}
          <linearGradient id="shield-chrome-inner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D0D0D0" />
            <stop offset="20%" stopColor="#B0B0B0" />
            <stop offset="50%" stopColor="#808080" />
            <stop offset="80%" stopColor="#505050" />
            <stop offset="100%" stopColor="#303030" />
          </linearGradient>
          {/* Horizontal chrome highlight */}
          <linearGradient id="shield-chrome-horiz" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#909090" />
            <stop offset="20%" stopColor="#C0C0C0" />
            <stop offset="50%" stopColor="#E8E8E8" />
            <stop offset="80%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#909090" />
          </linearGradient>
          {/* Blue orb core glow */}
          <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="40%" stopColor="#00A8E8" />
            <stop offset="70%" stopColor="#0080C0" />
            <stop offset="100%" stopColor="#004080" />
          </radialGradient>
          {/* Orb outer glow effect */}
          <filter id="orb-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Shield drop shadow */}
          <filter id="shield-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.5"/>
          </filter>
          {/* Inner bevel effect */}
          <filter id="inner-bevel" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
            <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
          </filter>
        </defs>

        {/* Shield outer body - chrome bevel */}
        <path
          d="M60 6 L112 28 L112 78 C112 106 90 126 60 140 C30 126 8 106 8 78 L8 28 Z"
          fill="url(#shield-chrome-outer)"
          filter="url(#shield-shadow)"
        />

        {/* Shield mid layer - secondary bevel */}
        <path
          d="M60 12 L106 32 L106 76 C106 102 86 120 60 133 C34 120 14 102 14 76 L14 32 Z"
          fill="url(#shield-chrome-horiz)"
        />

        {/* Shield inner border - chrome edge */}
        <path
          d="M60 18 L100 36 L100 74 C100 98 82 114 60 126 C38 114 20 98 20 74 L20 36 Z"
          fill="url(#shield-chrome-inner)"
        />

        {/* Black interior */}
        <path
          d="M60 24 L94 40 L94 72 C94 94 78 108 60 119 C42 108 26 94 26 72 L26 40 Z"
          fill="#0A0A0A"
        />

        {/* Subtle interior gradient overlay */}
        <path
          d="M60 24 L94 40 L94 72 C94 94 78 108 60 119 C42 108 26 94 26 72 L26 40 Z"
          fill="url(#shield-chrome-inner)"
          opacity="0.1"
        />

        {/* Orb outer glow */}
        <circle cx="60" cy="68" r="24" fill="#00A8E8" opacity="0.3" filter="url(#orb-blur)"/>

        {/* Blue orb core */}
        <circle cx="60" cy="68" r="18" fill="url(#orb-glow)"/>

        {/* Orb highlight reflection */}
        <ellipse cx="54" cy="62" rx="6" ry="4" fill="white" opacity="0.5"/>
        <ellipse cx="52" cy="60" rx="3" ry="2" fill="white" opacity="0.8"/>

        {/* Vertical crosshair line - top */}
        <line x1="60" y1="30" x2="60" y2="48" stroke="#00D4FF" strokeWidth="2" opacity="0.9"/>

        {/* Vertical crosshair line - bottom */}
        <line x1="60" y1="88" x2="60" y2="112" stroke="#00D4FF" strokeWidth="2" opacity="0.9"/>

        {/* Left horizontal reticle dashes */}
        <line x1="30" y1="68" x2="38" stroke="#00E5FF" strokeWidth="2.5" opacity="0.95"/>
        <line x1="32" y1="62" x2="36" y2="62" stroke="#00E5FF" strokeWidth="1.5" opacity="0.7"/>
        <line x1="32" y1="74" x2="36" y2="74" stroke="#00E5FF" strokeWidth="1.5" opacity="0.7"/>

        {/* Right horizontal reticle dashes */}
        <line x1="82" y1="68" x2="90" y2="68" stroke="#00E5FF" strokeWidth="2.5" opacity="0.95"/>
        <line x1="84" y1="62" x2="88" y2="62" stroke="#00E5FF" strokeWidth="1.5" opacity="0.7"/>
        <line x1="84" y1="74" x2="88" y2="74" stroke="#00E5FF" strokeWidth="1.5" opacity="0.7"/>

        {/* Center crosshair dot */}
        <circle cx="60" cy="68" r="2" fill="#FFFFFF" opacity="0.9"/>
      </svg>
    );
  }

  // Sidebar & favicon variant — simplified chrome shield with reticle
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
      <defs>
        {/* Chrome gradient for small shield */}
        <linearGradient id="mini-chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E0" />
          <stop offset="50%" stopColor="#A0A0A0" />
          <stop offset="100%" stopColor="#505050" />
        </linearGradient>
        {/* Blue orb gradient */}
        <radialGradient id="mini-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0080C0" />
        </radialGradient>
      </defs>

      {/* Shield outline - chrome bevel */}
      <path
        d="M12 2 L21 6.5 L21 12 C21 17.5 17 22 12 23.5 C7 22 3 17.5 3 12 L3 6.5 Z"
        fill="url(#mini-chrome)"
        stroke="#707070"
        strokeWidth="0.5"
      />

      {/* Black interior */}
      <path
        d="M12 4 L19 7.5 L19 12 C19 16.5 15.5 20 12 21.5 C8.5 20 5 16.5 5 12 L5 7.5 Z"
        fill="#0A0A0A"
      />

      {/* Blue orb */}
      <circle cx="12" cy="11.5" r="3" fill="url(#mini-orb)" />

      {/* Vertical crosshair */}
      <line x1="12" y1="5.5" x2="12" y2="7.5" stroke="#00D4FF" strokeWidth="1" opacity="0.8"/>
      <line x1="12" y1="15.5" x2="12" y2="18" stroke="#00D4FF" strokeWidth="1" opacity="0.8"/>

      {/* Horizontal reticle marks */}
      <line x1="7" y1="11.5" x2="8.5" y2="11.5" stroke="#00E5FF" strokeWidth="1" opacity="0.9"/>
      <line x1="15.5" y1="11.5" x2="17" y2="11.5" stroke="#00E5FF" strokeWidth="1" opacity="0.9"/>

      {/* Center dot */}
      <circle cx="12" cy="11.5" r="0.75" fill="white" opacity="0.9"/>

      {/* Orb highlight */}
      <circle cx="11" cy="10.5" r="0.75" fill="white" opacity="0.5"/>
    </svg>
  );
}
