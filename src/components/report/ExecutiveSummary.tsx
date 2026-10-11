import { useEffect, useState } from 'react';
import { Flame, LayoutDashboard, Trophy } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { CompatibilityReport, Status, bandMeta, statusMeta, statusOrder } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { SectionHeading, StatusChip } from './primitives';
import { statusClasses, statusIcons } from './statusStyles';

const IndexGauge = ({ value }: { value: number }) => {
  const radius = 80;
  const circumference = Math.PI * radius;
  const target = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(target));
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <svg viewBox="0 0 200 116" className="w-full max-w-[260px]" role="img" aria-label={`Compatibility Index ${Math.round(value)} out of 100`}>
      <defs>
        <linearGradient id="gauge-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="14" strokeLinecap="round" />
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="url(#gauge-gradient)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
      <text x="100" y="92" textAnchor="middle" className="fill-primary font-display" style={{ fontSize: 52, fontWeight: 600 }}>
        {Math.round(value)}
      </text>
      <text x="100" y="112" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10, letterSpacing: 1.5 }}>
        OUT OF 100
      </text>
    </svg>
  );
};

const bandStatus: Record<CompatibilityReport['band'], Status> = {
  strong: 'aligned',
  solid: 'discuss',
  significant: 'priority',
};

const ExecutiveSummary = ({ report }: { report: CompatibilityReport }) => {
  const { index, band, counts, narrative, strengths, priorities, confirmItems, items } = report;
  const topConversations = [...priorities, ...confirmItems].slice(0, 3);
  const BandIcon = statusIcons[bandStatus[band]];

  return (
    <section className="space-y-8">
      <SectionHeading id="summary" eyebrow="01 / Executive summary" title="The short version" icon={LayoutDashboard} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="surface mesh flex flex-col items-center p-8 text-center">
          <p className="eyebrow">Compatibility Index</p>
          <div className="mt-4 w-full">
            <IndexGauge value={index} />
          </div>
          <span
            className={cn('status-chip mt-4 px-3 py-1 text-sm', statusClasses[bandStatus[band]].soft, statusClasses[bandStatus[band]].text)}
          >
            <BandIcon className="h-4 w-4" aria-hidden="true" />
            {bandMeta[band].label}
          </span>
          <p className="mt-3 text-xs text-muted-foreground">Based on {items.length} questions you both answered</p>
        </div>

        <div className="surface p-8">
          <p className="font-display text-2xl leading-snug text-foreground md:text-[1.7rem]">{narrative}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {statusOrder
              .slice()
              .reverse()
              .map((status, i) => {
                const Icon = statusIcons[status];
                const share = items.length ? (counts[status] / items.length) * 100 : 0;
                return (
                  <div
                    key={status}
                    className={cn('lift animate-fade-up rounded-xl border p-4', statusClasses[status].soft, statusClasses[status].border)}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn('font-display text-4xl font-semibold', statusClasses[status].text)}>{counts[status]}</div>
                      <Icon className={cn('h-5 w-5', statusClasses[status].text)} aria-hidden="true" />
                    </div>
                    <div className={cn('mt-1 text-xs font-medium', statusClasses[status].text)}>{statusMeta[status].label}</div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-card/70">
                      <div className={cn('h-full rounded-full', statusClasses[status].solid)} style={{ width: `${share}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="surface p-8">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile h-8 w-8 rounded-lg bg-aligned-soft text-aligned">
              <Trophy className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="eyebrow !text-aligned">Where you stand together</p>
          </div>
          {strengths.length ? (
            <ol className="mt-5 space-y-4">
              {strengths.map((s) => (
                <li key={s.category} className="flex items-center gap-4">
                  <CategoryIcon category={s.category} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{s.category}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-aligned" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {Math.round(s.score)} / 100 · {s.items.length} {s.items.length === 1 ? 'question' : 'questions'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No life area reaches strong alignment yet. Start with the conversation guide below.
            </p>
          )}
        </div>

        <div className="surface p-8">
          <div className="flex items-center gap-2.5">
            <span className="icon-tile h-8 w-8 rounded-lg bg-priority-soft text-priority">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="eyebrow !text-priority">Talk about these first</p>
          </div>
          {topConversations.length ? (
            <ol className="mt-5 space-y-4">
              {topConversations.map((item) => (
                <li key={item.question.id} className="flex gap-4">
                  <CategoryIcon category={item.question.category} size="md" />
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{item.question.question}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.question.category}</span>
                      <StatusChip status={item.status} short />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No priority conversations. Use the discussion items to deepen what is already working.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExecutiveSummary;
