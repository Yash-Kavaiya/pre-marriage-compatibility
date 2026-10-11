import { Calculator, Info, ListChecks, Scale } from 'lucide-react';
import { statusMeta, statusOrder } from '@/lib/compatibility';
import { SectionHeading, StatusChip } from './primitives';

const CardTitle = ({ icon: Icon, children }: { icon: typeof Info; children: React.ReactNode }) => (
  <p className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-primary">
    <span className="icon-tile h-8 w-8 rounded-lg bg-primary-soft">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    {children}
  </p>
);

const Methodology = () => (
  <section className="space-y-8">
    <SectionHeading id="method" eyebrow="07 / Methodology" title="How this report is calculated" icon={Calculator} />

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface space-y-5 p-6 sm:p-8">
        <CardTitle icon={ListChecks}>Question status</CardTitle>
        <ul className="space-y-4">
          {statusOrder
            .slice()
            .reverse()
            .map((s) => (
              <li key={s} className="flex flex-col gap-1.5">
                <StatusChip status={s} className="self-start" />
                <p className="text-sm leading-relaxed text-muted-foreground">{statusMeta[s].description}</p>
              </li>
            ))}
        </ul>
        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Rules: a difference in importance of 0 or 1 is Aligned (or Confirm stance when both rate it 4+ and hold it at
          4+ firmness). A difference of 2 is Worth discussing, rising to Priority when the partner who cares more is
          firm (4+). A difference of 3 or more is Priority, unless both partners are flexible (2 or below).
        </p>
      </div>

      <div className="space-y-6">
        <div className="surface space-y-3 p-6 sm:p-8">
          <CardTitle icon={Scale}>Compatibility Index</CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Each question scores 100, minus 20 points per step of difference in importance, minus up to 20 more when a
            gap of 2 or more meets a firm position. Confirm-stance items are capped at 85 until you verify them. Questions
            are weighted by how important they are to the two of you, so a gap on something you both care about counts
            more than a gap on something neither of you minds. 80 and above is a strong foundation; 65 to 79 is solid with
            growth areas; below 65 signals significant differences.
          </p>
        </div>
        <div className="surface space-y-3 border-accent/40 bg-accent-soft/40 p-6 sm:p-8">
          <CardTitle icon={Info}>An important note</CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This report measures how much weight you each give to topics, not the specific positions you hold. It is a
            structured starting point for conversation, not a prediction of whether your marriage will succeed. For
            priority areas, and especially for high-stakes ones, we strongly recommend working through them with a
            qualified premarital counselor or a trusted mentor couple.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Methodology;
