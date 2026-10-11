import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Flag, Gauge, LucideIcon, MoveHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryIcon from '@/components/CategoryIcon';
import SiteHeader from '@/components/SiteHeader';
import {
  Question,
  assessmentCategories,
  assessmentQuestions,
  flexibilityLabels,
  importanceLabels,
} from '@/data/assessmentQuestions';
import { discussionGuides } from '@/data/discussionGuides';
import { highStakesCategories } from '@/lib/compatibility';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  partnerName: string;
  answeredCount: number;
  importance: number;
  flexibility: number;
  onImportanceChange: (value: number) => void;
  onFlexibilityChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
}

const total = assessmentQuestions.length;
const AUTO_ADVANCE_MS = 450;

const categoryQuestions = (category: string) => assessmentQuestions.filter((q) => q.category === category);

interface ScaleProps {
  id: string;
  title: string;
  icon: LucideIcon;
  hint: string;
  shortcut: string;
  labels: string[];
  value: number;
  onChange: (value: number) => void;
}

const Scale = ({ id, title, icon: Icon, hint, shortcut, labels, value, onChange }: ScaleProps) => (
  <fieldset className="space-y-3">
    <div className="flex items-center justify-between gap-4">
      <legend id={id} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        <span className="icon-tile h-7 w-7 rounded-lg bg-primary-soft">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </legend>
      <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[0.65rem] text-muted-foreground md:inline">
        {shortcut}
      </kbd>
    </div>
    <p className="text-sm text-muted-foreground">{hint}</p>
    <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-5 gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const selected = value === n;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${n}: ${label}`}
            onClick={() => onChange(n)}
            className={cn(
              'group flex min-h-[4.5rem] flex-col items-center justify-start gap-1.5 rounded-xl border px-1 py-3 text-center transition-all duration-200',
              selected
                ? 'brand-gradient scale-[1.04] border-transparent text-primary-foreground shadow-lg shadow-primary/25'
                : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-soft hover:shadow-md',
            )}
          >
            <span className={cn('font-display text-2xl font-semibold leading-none', !selected && 'text-primary')}>{n}</span>
            <span
              className={cn(
                'hidden text-[0.7rem] leading-tight sm:block',
                selected ? 'text-primary-foreground/85' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
    <div className="flex justify-between text-xs text-muted-foreground sm:hidden">
      <span>{labels[0]}</span>
      <span>{labels[labels.length - 1]}</span>
    </div>
    <p className="min-h-[1.25rem] text-sm font-medium text-foreground sm:hidden" aria-live="polite">
      {value ? labels[value - 1] : ''}
    </p>
  </fieldset>
);

const CategoryStepper = ({ currentCategory, questionIndex }: { currentCategory: string; questionIndex: number }) => (
  <nav aria-label="Assessment sections" className="sticky top-6">
    <p className="eyebrow mb-4">Sections</p>
    <ol className="space-y-1">
      {assessmentCategories.map((category) => {
        const questions = categoryQuestions(category);
        const lastIndex = assessmentQuestions.indexOf(questions[questions.length - 1]);
        const done = lastIndex < questionIndex;
        const current = category === currentCategory;
        return (
          <li
            key={category}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
              current ? 'bg-primary-soft font-medium text-primary' : done ? 'text-foreground/70' : 'text-muted-foreground',
            )}
          >
            {done ? (
              <span className="icon-tile h-6 w-6 rounded-md bg-aligned text-background">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : (
              <CategoryIcon category={category} size="xs" className={cn(!current && 'opacity-60 grayscale')} />
            )}
            <span className="truncate">{category}</span>
          </li>
        );
      })}
    </ol>
  </nav>
);

const QuestionCard = ({
  question,
  questionIndex,
  partnerName,
  answeredCount,
  importance,
  flexibility,
  onImportanceChange,
  onFlexibilityChange,
  onNext,
  onPrevious,
  onExit,
}: QuestionCardProps) => {
  const categoryIndex = assessmentCategories.indexOf(question.category);
  const inCategory = categoryQuestions(question.category);
  const positionInCategory = inCategory.indexOf(question) + 1;
  const bothAnswered = importance > 0 && flexibility > 0;
  const isLast = questionIndex === total - 1;

  const [showIntro, setShowIntro] = useState(() => questionIndex === 0 && answeredCount === 0);
  const previousIndex = useRef(questionIndex);
  const pendingAdvance = useRef(false);
  const advanceTimer = useRef<number>();
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  useEffect(() => {
    const movedForward = questionIndex > previousIndex.current;
    const enteredNewCategory =
      questionIndex > 0 && assessmentQuestions[questionIndex - 1].category !== question.category;
    if (movedForward && enteredNewCategory) setShowIntro(true);
    previousIndex.current = questionIndex;
    pendingAdvance.current = false;
    window.clearTimeout(advanceTimer.current);
  }, [questionIndex, question.category]);

  useEffect(() => {
    if (!pendingAdvance.current || !bothAnswered) return;
    pendingAdvance.current = false;
    if (isLast) return;
    advanceTimer.current = window.setTimeout(() => onNextRef.current(), AUTO_ADVANCE_MS);
  }, [importance, flexibility, bothAnswered, isLast]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const choose = (field: 'importance' | 'flexibility', value: number) => {
    pendingAdvance.current = true;
    (field === 'importance' ? onImportanceChange : onFlexibilityChange)(value);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [role="dialog"]')) return;

      if (showIntro) {
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          setShowIntro(false);
        }
        return;
      }

      const digit = /^Digit([1-5])$/.exec(e.code);
      if (digit) {
        e.preventDefault();
        choose(e.shiftKey ? 'flexibility' : 'importance', Number(digit[1]));
        return;
      }
      const wantsNext = e.key === 'ArrowRight' || (e.key === 'Enter' && target.tagName !== 'BUTTON');
      if (wantsNext && bothAnswered) {
        e.preventDefault();
        onNextRef.current();
      } else if (e.key === 'ArrowLeft' && questionIndex > 0) {
        e.preventDefault();
        onPrevious();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const progress = (answeredCount / total) * 100;

  return (
    <div className="paper flex min-h-screen flex-col">
      <SiteHeader
        right={
          <Button variant="ghost" size="sm" onClick={onExit}>
            Save and exit
          </Button>
        }
      />
      <div className="h-1.5 w-full bg-border/60" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={total}>
        <div className="brand-gradient h-full rounded-r-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="container flex-1 py-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
          <aside className="hidden lg:block">
            <CategoryStepper currentCategory={question.category} questionIndex={questionIndex} />
          </aside>

          <main className="mx-auto w-full max-w-3xl">
            {showIntro ? (
              <section
                key={`intro-${question.category}`}
                className="surface mesh relative animate-fade-up overflow-hidden p-8 md:p-12"
              >
                <CategoryIcon
                  category={question.category}
                  size="lg"
                  className="animate-pop-in shadow-lg"
                />
                <p className="eyebrow mt-6">
                  Section {categoryIndex + 1} of {assessmentCategories.length}
                </p>
                <h1 className="mt-3 text-4xl font-semibold text-primary md:text-5xl">{question.category}</h1>
                {highStakesCategories.has(question.category) && (
                  <span className="status-chip status-priority mt-4">
                    <Flag className="h-3.5 w-3.5" /> High-stakes area
                  </span>
                )}
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {discussionGuides[question.category]?.why}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {inCategory.length} {inCategory.length === 1 ? 'question' : 'questions'}
                  {questionIndex === 0 && `. Take your time, ${partnerName}; there are no right answers.`}
                </p>
                <Button size="lg" className="mt-8 h-12 px-6" onClick={() => setShowIntro(false)} autoFocus>
                  {questionIndex === 0 ? 'Start' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </section>
            ) : (
              <section key={question.id} className="animate-fade-up">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2.5">
                    <CategoryIcon category={question.category} size="sm" />
                    <span className="eyebrow">{question.category}</span>
                    <span>
                      {positionInCategory} of {inCategory.length}
                    </span>
                  </p>
                  <p>
                    Question {questionIndex + 1} of {total}
                  </p>
                </div>

                <h1 className="mt-5 text-3xl font-semibold leading-tight text-foreground md:text-[2.6rem]">
                  {question.question}
                </h1>
                {question.explanation && (
                  <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{question.explanation}</p>
                )}

                <div className="surface mt-8 space-y-8 p-5 md:p-8">
                  <Scale
                    id={`importance-${question.id}`}
                    title="Importance to me"
                    icon={Gauge}
                    hint="How much does this topic matter to you in a marriage?"
                    shortcut="Keys 1-5"
                    labels={importanceLabels}
                    value={importance}
                    onChange={(v) => choose('importance', v)}
                  />
                  <div className="hairline" />
                  <Scale
                    id={`flexibility-${question.id}`}
                    title="My flexibility"
                    icon={MoveHorizontal}
                    hint="If your partner sees it differently, how much room do you have to adapt?"
                    shortcut="Shift + 1-5"
                    labels={flexibilityLabels}
                    value={flexibility}
                    onChange={(v) => choose('flexibility', v)}
                  />
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <Button variant="ghost" onClick={onPrevious} disabled={questionIndex === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <p className="hidden text-center text-xs text-muted-foreground md:block" aria-live="polite">
                    {!bothAnswered
                      ? 'Choose both ratings to continue'
                      : isLast
                        ? 'That was the last question.'
                        : 'Answer saved'}
                  </p>
                  <Button onClick={onNext} disabled={!bothAnswered} size="lg">
                    {isLast ? 'Finish and seal my answers' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
