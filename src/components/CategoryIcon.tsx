import type { CSSProperties } from 'react';
import { getCategoryVisual } from '@/lib/categoryVisuals';
import { cn } from '@/lib/utils';

const sizes = {
  xs: { tile: 'h-6 w-6 rounded-md', icon: 'h-3.5 w-3.5' },
  sm: { tile: 'h-8 w-8 rounded-lg', icon: 'h-4 w-4' },
  md: { tile: 'h-11 w-11 rounded-xl', icon: 'h-5 w-5' },
  lg: { tile: 'h-16 w-16 rounded-2xl', icon: 'h-8 w-8' },
};

interface CategoryIconProps {
  category: string;
  size?: keyof typeof sizes;
  className?: string;
}

const CategoryIcon = ({ category, size = 'sm', className }: CategoryIconProps) => {
  const { icon: Icon, hue } = getCategoryVisual(category);
  return (
    <span
      className={cn('icon-tile cat-tile', sizes[size].tile, className)}
      style={{ '--cat-h': hue } as CSSProperties}
      aria-hidden="true"
    >
      <Icon className={sizes[size].icon} strokeWidth={1.9} />
    </span>
  );
};

export default CategoryIcon;
