'use client';
import Image from 'next/image';

interface AclShieldIconProps {
  size?: number;
  className?: string;
  variant?: 'sidebar' | 'login' | 'favicon';
}

export default function AclShieldIcon({ size = 24, className = '', variant = 'sidebar' }: AclShieldIconProps) {
  const imgSize = variant === 'login' ? size : size;
  return (
    <Image
      src="/images/acl-shield.jpg"
      alt="AI Command Lab Shield"
      width={imgSize}
      height={imgSize}
      className={`${className} rounded-sm`}
      priority={variant === 'login'}
    />
  );
}
