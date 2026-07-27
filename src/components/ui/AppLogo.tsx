import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

type AppLogoProps = {
  size?: 'navbar' | 'sidebar' | 'compact';
  className?: string;
};

export function AppLogo({ size = 'navbar', className }: AppLogoProps) {
  const logo =
    size === 'compact'
      ? {
          src: '/images/geq@4x.png',
          alt: 'GEQ',
        }
      : {
          src: '/images/niia@4x.png',
          alt: 'NIIA',
        };

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={46}
      height={16}
      priority
      className={cn('object-contain', className)}
    />
  );
}
