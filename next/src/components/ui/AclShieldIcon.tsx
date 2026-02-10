'use client';
import Image from 'next/image';

interface AclShieldIconProps {
  size?: number;
  className?: string;
  variant?: 'sidebar' | 'login' | 'favicon';
}

export default function AclShieldIcon({ size = 24, className = '', variant = 'sidebar' }: AclShieldIconProps) {
  return (
    <Image
      src="/images/acl-shield.jpg"
      alt="AI Command Lab"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: variant === 'sidebar' ? '4px' : '8px', objectFit: 'contain' }}
      priority={variant === 'login'}
    />
  );
}
