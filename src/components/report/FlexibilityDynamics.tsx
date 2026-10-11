import { MoveHorizontal } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { CompatibilityReport } from '@/lib/compatibility';
import { PartnerAvatar, PartnerLegend, SectionHeading } from './primitives';

const position = (value: number) => `${((value - 1) / 4) * 100}%`;

const FlexibilityDynamics = ({ report }: { report: CompatibilityReport }) => {
  const { categories, partnerA, partnerB, flexibility } = report;
  const a = partnerA.name;
  const b = partnerB.name;

  const summary = flexibility.carrier
    ? `${flexibility.carrier === 'A' ? a : b} is the more flexible partner in most life areas. Healthy marriages need compromise to flow both ways, so notice where the other partner can offer some ground too.`
    : flexibility.aMoreFlexible === 0 && flexibility.bMoreFlexible === 0
      ? 'You hold your positions with similar firmness across every area, so neither of you is carrying the compromise alone.'
      : `Flexibility is shared: ${a} has more room in ${flexibility.aMoreFlexible} ${flexibility.aMoreFlexible === 1 ? 'area' : 'areas'}, ${b} in ${flexibility.bMoreFlexible}, and ${flexibility.balanced} ${flexibility.balanced === 1 ? 'is' : 'are'} balanced. Neither of you is carrying the compromise alone.`;

  return (
    <section className="space-y-8">
      <SectionHeading
        id="flexibility"
        eyebrow="05 / Flexibility dynamics"
        title="Who has room to move, and where"
        description="Differences matter less when someone can adapt. Each line shows how firmly each of you holds your views in an area, from very flexible on the left to non-negotiable on the right."
        icon={MoveHorizontal}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="surface mesh space-y-6 p-6 sm:p-8">
          <p className="font-display text-2xl leading-snug">{summary}</p>
          <dl className="grid grid-cols-2 gap-4 border-t border-border pt-6 text-sm">
            <div className="space-y-2">
              <PartnerAvatar name={a} partner="a" size="sm" />
              <dt className="text-muted-foreground">{a}, average firmness</dt>
              <dd className="font-display text-3xl font-semibold text-partner-a">{flexibility.avgFlexA.toFixed(1)}</dd>
            </div>
            <div className="space-y-2">
              <PartnerAvatar name={b} partner="b" size="sm" />
              <dt className="text-muted-foreground">{b}, average firmness</dt>
              <dd className="font-display text-3xl font-semibold text-partner-b">{flexibility.avgFlexB.toFixed(1)}</dd>
            </div>
          </dl>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between text-xs text-muted-foreground">
            <PartnerLegend a={a} b={b} />
            <span className="hidden sm:inline">Flexible to firm</span>
          </div>
          <ul className="space-y-4">
            {categories.map((c) => (
              <li key={c.category} className="grid grid-cols-[9rem_1fr] items-center gap-4 sm:grid-cols-[13rem_1fr_6rem]">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <CategoryIcon category={c.category} size="xs" />
                  <span className="truncate">{c.category}</span>
                </span>
                <div className="relative h-2.5 rounded-full bg-gradient-to-r from-aligned/30 via-discuss/25 to-priority/30">
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-partner-a shadow"
                    style={{ left: position(c.flexibilityA) }}
                    title={`${a}: ${c.flexibilityA.toFixed(1)}`}
                  />
                  <span
                    className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-partner-b shadow"
                    style={{ left: position(c.flexibilityB) }}
                    title={`${b}: ${c.flexibilityB.toFixed(1)}`}
                  />
                </div>
                <span className="hidden text-right text-xs text-muted-foreground sm:block">
                  {c.moreFlexible === 'balanced' ? 'Balanced' : `${c.moreFlexible === 'A' ? a : b} adapts`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FlexibilityDynamics;
