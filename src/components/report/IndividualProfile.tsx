import { Download, Lightbulb, Sparkle } from 'lucide-react';
import { PartnerAvatar } from '@/components/report/primitives';
import { Button } from '@/components/ui/button';
import type { PartnerData } from '@/lib/types';
import { generateQualityOfLifeAnalysis } from '@/utils/qualityOfLifeAnalysis';
import { cn } from '@/lib/utils';

interface IndividualProfileProps {
  partner: PartnerData;
  accent?: 'a' | 'b';
  onDownload?: () => void;
  className?: string;
}

const IndividualProfile = ({ partner, accent = 'a', onDownload, className }: IndividualProfileProps) => {
  const analysis = generateQualityOfLifeAnalysis(partner.responses);
  const clarity = Math.round(analysis.overallScore * 20);

  return (
    <article className={cn('surface flex flex-col p-6 sm:p-8', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <PartnerAvatar name={partner.name} partner={accent} />
          <div>
            <p className="eyebrow">Individual profile</p>
            <h3 className="mt-1 text-3xl font-semibold">{partner.name}</h3>
          </div>
        </div>
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={accent === 'a' ? 'hsl(var(--partner-a))' : 'hsl(var(--partner-b))'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(clarity / 100) * 97.4} 97.4`}
            />
          </svg>
          <div className="text-center">
            <div className={cn('font-display text-xl font-semibold leading-none', accent === 'a' ? 'text-partner-a' : 'text-partner-b')}>
              {clarity}
            </div>
            <div className="text-[0.55rem] uppercase tracking-wider text-muted-foreground">Clarity</div>
          </div>
        </div>
      </div>

      <div className="hairline my-6" />

      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-primary">{analysis.profileTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{analysis.personalityProfile}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{analysis.readinessTitle}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{analysis.relationshipReadiness}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-aligned-soft p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-aligned">
              <Sparkle className="h-3.5 w-3.5" aria-hidden="true" /> Clearest areas
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {(analysis.strengths.length ? analysis.strengths.slice(0, 3) : ['Still forming']).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-discuss-soft p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-discuss">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> To reflect on
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {(analysis.growthAreas.length ? analysis.growthAreas : ['Nothing stands out']).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Average importance</dt>
            <dd className="font-medium">{analysis.avgImportance.toFixed(1)} / 5</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Average firmness</dt>
            <dd className="font-medium">{analysis.avgFlexibility.toFixed(1)} / 5</dd>
          </div>
        </dl>
      </div>

      {onDownload && (
        <Button variant="outline" className="mt-6 self-start" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" /> Download individual PDF
        </Button>
      )}
    </article>
  );
};

export default IndividualProfile;
