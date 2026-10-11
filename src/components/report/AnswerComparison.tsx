import { useMemo, useState } from 'react';
import { Columns2, ListChecks } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { assessmentCategories, flexibilityLabels, importanceLabels } from '@/data/assessmentQuestions';
import { CompatibilityReport, Status, statusMeta, statusOrder } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { PartnerAvatar, PartnerLegend, RatingDots, SectionHeading, StatusChip } from './primitives';
import { statusIcons } from './statusStyles';

type StatusFilter = Status | 'all';

const PartnerAnswer = ({
  name,
  partner,
  importance,
  flexibility,
}: {
  name: string;
  partner: 'a' | 'b';
  importance: number;
  flexibility: number;
}) => (
  <div className="min-w-0 space-y-1.5">
    <p className={cn('flex items-center gap-2 text-xs font-semibold', partner === 'a' ? 'text-partner-a' : 'text-partner-b')}>
      <PartnerAvatar name={name} partner={partner} size="sm" className="h-6 w-6 text-[0.65rem] ring-2" />
      {name}
    </p>
    <div className="flex items-center gap-2 text-xs">
      <span className="w-[4.5rem] shrink-0 text-muted-foreground">Importance</span>
      <RatingDots value={importance} partner={partner} label={`${name} importance`} />
    </div>
    <p className="pl-[5rem] text-xs text-foreground/80">{importanceLabels[importance - 1]}</p>
    <div className="flex items-center gap-2 text-xs">
      <span className="w-[4.5rem] shrink-0 text-muted-foreground">Flexibility</span>
      <RatingDots value={flexibility} partner={partner} label={`${name} flexibility`} />
    </div>
    <p className="pl-[5rem] text-xs text-foreground/80">{flexibilityLabels[flexibility - 1]}</p>
  </div>
);

const AnswerComparison = ({ report }: { report: CompatibilityReport }) => {
  const { items, partnerA, partnerB, counts } = report;
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(
    () =>
      items.filter(
        (i) => (category === 'all' || i.question.category === category) && (status === 'all' || i.status === status),
      ),
    [items, category, status],
  );

  const filters: { key: StatusFilter; label: string; count: number; icon: typeof ListChecks }[] = [
    { key: 'all', label: 'All', count: items.length, icon: ListChecks },
    ...statusOrder.map((s) => ({ key: s, label: statusMeta[s].short, count: counts[s], icon: statusIcons[s] })),
  ];

  return (
    <section className="space-y-6">
      <SectionHeading
        id="answers"
        eyebrow="04 / Side by side"
        title="Every answer, next to each other"
        description={`Here is how ${partnerA.name} and ${partnerB.name} answered each question. Filter by life area or status to focus a conversation.`}
        icon={Columns2}
      />

      <div className="surface sticky top-[7.25rem] z-[5] flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {filters.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              onClick={() => setStatus(key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                status === key
                  ? 'brand-gradient border-transparent text-primary-foreground shadow-sm'
                  : 'border-border bg-card hover:bg-muted',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <PartnerLegend a={partnerA.name} b={partnerB.name} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by life area"
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="all">All life areas</option>
            {assessmentCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="surface p-8 text-center text-muted-foreground">No questions match these filters.</p>
      ) : (
        <ul className="surface divide-y divide-border">
          {filtered.map((item) => (
            <li
              key={item.question.id}
              className={cn('grid gap-4 border-l-4 p-5 md:grid-cols-[1.4fr_1fr_1fr] md:gap-6', 'border-l-transparent', {
                'border-l-priority': item.status === 'priority',
                'border-l-confirm': item.status === 'confirm',
                'border-l-discuss': item.status === 'discuss',
              })}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryIcon category={item.question.category} size="xs" />
                  <span className="text-xs text-muted-foreground">
                    Q{item.question.id} · {item.question.category}
                  </span>
                </div>
                <p className="mt-1 font-medium leading-snug">{item.question.question}</p>
                {item.question.explanation && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.question.explanation}</p>
                )}
                <StatusChip status={item.status} className="mt-3" />
              </div>
              <PartnerAnswer name={partnerA.name} partner="a" importance={item.a.importance} flexibility={item.a.flexibility} />
              <PartnerAnswer name={partnerB.name} partner="b" importance={item.b.importance} flexibility={item.b.flexibility} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AnswerComparison;
