import { Link } from 'react-router-dom';
import ThemePicker from '@/components/ThemePicker';
import { cn } from '@/lib/utils';

export const BrandMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 28" aria-hidden="true" className={cn('h-6 w-auto', className)}>
    <circle cx="14" cy="14" r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.25" />
    <circle cx="26" cy="14" r="10" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.25" />
    <path d="M20 6 A10 10 0 0 1 20 22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.25" />
  </svg>
);

interface SiteHeaderProps {
  right?: React.ReactNode;
  className?: string;
}

const SiteHeader = ({ right, className }: SiteHeaderProps) => (
  <header className={cn('border-b border-border/70 bg-background/80 backdrop-blur-md', className)}>
    <div className="container flex h-16 items-center justify-between gap-4">
      <Link to="/" className="group flex items-center gap-2.5" aria-label="Before You Say Yes, home">
        <BrandMark className="transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110" />
        <span className="font-display text-xl font-semibold tracking-tight text-primary">Before You Say Yes</span>
      </Link>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {right}
        <ThemePicker />
      </div>
    </div>
  </header>
);

export default SiteHeader;
