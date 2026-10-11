import type { LucideIcon } from 'lucide-react';
import { Status, statusMeta } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { statusClasses, statusIcons } from './statusStyles';

export const StatusChip = ({ status, short, className }: { status: Status; short?: boolean; className?: string }) => {
  const Icon = statusIcons[status];
  return (
    <span className={cn('status-chip', statusClasses[status].soft, statusClasses[status].text, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {short ? statusMeta[status].short : statusMeta[status].label}
    </span>
  );
};

export const RatingDots = ({
  value,
  partner,
  label,
}: {
  value: number;
  partner: 'a' | 'b';
  label: string;
}) => (
  <span className="inline-flex items-center gap-1" role="img" aria-label={`${label}: ${value} of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        className={cn(
          'h-2 w-2 rounded-full',
          n <= value ? (partner === 'a' ? 'bg-partner-a' : 'bg-partner-b') : 'bg-border',
        )}
      />
    ))}
  </span>
);

export const SectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}) => (
  <header id={id} className="scroll-mt-32">
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="icon-tile brand-gradient h-9 w-9 text-primary-foreground shadow-md">
          <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </span>
      )}
      <p className="eyebrow">{eyebrow}</p>
    </div>
    <h2 className="mt-3 text-4xl font-semibold text-primary">{title}</h2>
    {description && <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{description}</p>}
  </header>
);

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export const PartnerAvatar = ({
  name,
  partner,
  size = 'md',
  className,
}: {
  name: string;
  partner: 'a' | 'b';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-primary-foreground ring-4 ring-card',
      partner === 'a' ? 'bg-partner-a' : 'bg-partner-b',
      { sm: 'h-8 w-8 text-sm', md: 'h-12 w-12 text-lg', lg: 'h-20 w-20 text-3xl' }[size],
      className,
    )}
    aria-hidden="true"
  >
    {initials(name)}
  </span>
);

export const PartnerLegend = ({ a, b }: { a: string; b: string }) => (
  <div className="flex items-center gap-4 text-xs text-muted-foreground">
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-partner-a" /> {a}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-partner-b" /> {b}
    </span>
  </div>
);
