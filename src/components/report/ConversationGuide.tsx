import { Flag, Heart, MessageSquareQuote, MessagesSquare } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import { discussionGuides } from '@/data/discussionGuides';
import { flexibilityLabels, importanceLabels } from '@/data/assessmentQuestions';
import { CompatibilityReport, QuestionComparison } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { SectionHeading, StatusChip } from './primitives';

const RatingLine = ({
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
  <p className="flex items-start gap-2 text-sm">
    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', partner === 'a' ? 'bg-partner-a' : 'bg-partner-b')} />
    <span>
      <span className="font-medium">{name}:</span>{' '}
      <span className="text-muted-foreground">
        {importanceLabels[importance - 1].toLowerCase()}, {flexibilityLabels[flexibility - 1].toLowerCase()}
      </span>
    </span>
  </p>
);

const ConversationGuide = ({ report }: { report: CompatibilityReport }) => {
  const { categories, partnerA, partnerB, sharedPriorities } = report;

  const groups = categories
    .map((c) => ({
      category: c,
      items: c.items
        .filter((i) => i.status === 'priority' || i.status === 'confirm')
        .sort((x, y) => (x.status === y.status ? y.importanceGap - x.importanceGap : x.status === 'priority' ? -1 : 1)),
    }))
    .filter((g) => g.items.length > 0)
    .sort(
      (x, y) =>
        Number(y.category.highStakes) - Number(x.category.highStakes) ||
        y.items.length - x.items.length ||
        x.category.score - y.category.score,
    );

  const discussCount = report.counts.discuss;

  return (
    <section className="space-y-8">
      <SectionHeading
        id="guide"
        eyebrow="03 / Conversation guide"
        title="What to talk about, and in what order"
        description="Set aside an unhurried hour for each of the first few areas. Take turns answering the prompts. The goal is to understand each other's reasons, not to win or to settle everything in one sitting."
        icon={MessagesSquare}
      />

      {groups.length === 0 ? (
        <div className="surface p-8">
          <p className="font-display text-2xl">No priority conversations stand out.</p>
          <p className="mt-2 text-muted-foreground">
            {discussCount > 0
              ? `You still have ${discussCount} topics marked "Worth discussing" in the answer comparison below. They make good starting points.`
              : 'Your answers line up closely. Use the shared priorities below to talk about how you will protect what already works.'}
          </p>
        </div>
      ) : (
        <ol className="space-y-6">
          {groups.map(({ category, items }, groupIndex) => {
            const guide = discussionGuides[category.category];
            return (
              <li key={category.category} className="surface overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-border bg-muted/40 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <CategoryIcon category={category.category} size="md" />
                      <span className="brand-gradient absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-bold text-primary-foreground ring-2 ring-card">
                        {groupIndex + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{category.category}</h3>
                      {guide && <p className="mt-1 text-sm text-muted-foreground">{guide.why}</p>}
                    </div>
                  </div>
                  {category.highStakes && (
                    <span className="status-chip status-priority shrink-0">
                      <Flag className="h-3.5 w-3.5" /> High-stakes area
                    </span>
                  )}
                </div>

                <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
                  <ul className="divide-y divide-border">
                    {items.map((item: QuestionComparison) => (
                      <li key={item.question.id} className="space-y-2 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-medium leading-snug">{item.question.question}</p>
                          <StatusChip status={item.status} short />
                        </div>
                        <RatingLine name={partnerA.name} partner="a" importance={item.a.importance} flexibility={item.a.flexibility} />
                        <RatingLine name={partnerB.name} partner="b" importance={item.b.importance} flexibility={item.b.flexibility} />
                        {item.status === 'confirm' && (
                          <p className="text-xs text-confirm">
                            You both hold firm here. Say your position out loud to check it is the same one.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {guide && (
                    <div className="border-t border-border bg-accent-soft/60 p-6 lg:border-l lg:border-t-0">
                      <p className="eyebrow flex items-center gap-2">
                        <MessageSquareQuote className="h-4 w-4" aria-hidden="true" /> Prompts to use
                      </p>
                      <ul className="mt-4 space-y-3">
                        {guide.prompts.map((prompt) => (
                          <li
                            key={prompt}
                            className="rounded-lg border-l-2 border-accent bg-card/70 px-4 py-3 font-display text-lg leading-snug"
                          >
                            "{prompt}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {sharedPriorities.length > 0 && (
        <div className="surface relative overflow-hidden p-6 sm:p-8">
          <div className="orb -right-16 -top-16 h-48 w-48 bg-aligned/15" aria-hidden="true" />
          <div className="relative flex items-center gap-2.5">
            <span className="icon-tile h-8 w-8 rounded-lg bg-aligned-soft text-aligned">
              <Heart className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            </span>
            <p className="eyebrow !text-aligned">Shared priorities to protect</p>
          </div>
          <p className="relative mt-2 text-sm text-muted-foreground">
            Topics you both rate as very important and see the same way. Name them to each other; they are the
            foundation you are building on.
          </p>
          <ul className="relative mt-5 grid gap-3 sm:grid-cols-2">
            {sharedPriorities.slice(0, 10).map((item) => (
              <li key={item.question.id} className="flex items-start gap-3 rounded-lg bg-aligned-soft/60 p-3 text-sm">
                <CategoryIcon category={item.question.category} size="xs" />
                <span>{item.question.question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ConversationGuide;
