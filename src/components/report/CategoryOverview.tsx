import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Flag, Radar as RadarIcon } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { CompatibilityReport, statusOrder } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { PartnerLegend, SectionHeading, StatusChip } from './primitives';
import { shortCategory, statusClasses } from './statusStyles';

const CategoryOverview = ({ report }: { report: CompatibilityReport }) => {
  const { categories, partnerA, partnerB } = report;
  const data = categories.map((c) => ({
    area: shortCategory[c.category] ?? c.category,
    [partnerA.name]: Number(c.importanceA.toFixed(2)),
    [partnerB.name]: Number(c.importanceB.toFixed(2)),
  }));

  return (
    <section className="space-y-8">
      <SectionHeading
        id="areas"
        eyebrow="02 / Life areas"
        icon={RadarIcon}
        title="How your priorities compare"
        description="The chart shows how much weight each of you gives every life area. Where the shapes overlap, you value things similarly. The table scores how closely your answers line up within each area."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Average importance by area</p>
            <PartnerLegend a={partnerA.name} b={partnerB.name} />
          </div>
          <div className="mt-4 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
                <Radar
                  name={partnerA.name}
                  dataKey={partnerA.name}
                  stroke="hsl(var(--partner-a))"
                  fill="hsl(var(--partner-a))"
                  fillOpacity={0.22}
                  strokeWidth={2.5}
                  dot={{ r: 3, fillOpacity: 1 }}
                />
                <Radar
                  name={partnerB.name}
                  dataKey={partnerB.name}
                  stroke="hsl(var(--partner-b))"
                  fill="hsl(var(--partner-b))"
                  fillOpacity={0.22}
                  strokeWidth={2.5}
                  dot={{ r: 3, fillOpacity: 1 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Life area</th>
                <th className="hidden px-3 py-3 font-medium sm:table-cell">Alignment</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.category} className="transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={c.category} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-medium">
                          {c.category}
                          {c.highStakes && <Flag className="h-3.5 w-3.5 text-priority" aria-label="High-stakes area" />}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1" aria-label="Question statuses">
                          {statusOrder
                            .slice()
                            .reverse()
                            .flatMap((s) =>
                              Array.from({ length: c.counts[s] }, (_, i) => (
                                <span key={`${s}-${i}`} className={cn('h-1.5 w-3 rounded-full', statusClasses[s].solid)} />
                              )),
                            )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden w-40 px-3 py-3 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div className={cn('h-full rounded-full', statusClasses[c.status].solid)} style={{ width: `${c.score}%` }} />
                      </div>
                      <span className="w-7 text-right tabular-nums text-muted-foreground">{Math.round(c.score)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StatusChip status={c.status} short />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex items-center gap-1.5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <Flag className="h-3.5 w-3.5 text-priority" /> High-stakes area. Gaps here are the hardest to compromise on later.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CategoryOverview;
