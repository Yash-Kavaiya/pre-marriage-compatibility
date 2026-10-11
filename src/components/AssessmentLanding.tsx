import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  FileText,
  Flag,
  Gauge,
  HeartHandshake,
  Link2,
  Lock,
  MessageSquareQuote,
  MessagesSquare,
  Mic,
  MoveHorizontal,
  PenLine,
  Scale,
  Send,
  Smartphone,
  SplitSquareHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryIcon from '@/components/CategoryIcon';
import SiteHeader, { BrandMark } from '@/components/SiteHeader';
import { StatusChip } from '@/components/report/primitives';
import { assessmentCategories, assessmentQuestions } from '@/data/assessmentQuestions';
import { discussionGuides } from '@/data/discussionGuides';
import { highStakesCategories } from '@/lib/compatibility';
import { parseSharedInput, SharedPayload } from '@/lib/shareLink';
import type { Draft } from '@/lib/storage';
import type { PartnerData } from '@/lib/types';

interface AssessmentLandingProps {
  inviter: PartnerData | null;
  draft: Draft | null;
  hasSealed: boolean;
  hasLastReport: boolean;
  canCompareWithSelf: boolean;
  onStart: (mode: 'text' | 'voice') => void;
  onResume: () => void;
  onDiscardDraft: () => void;
  onViewSealed: () => void;
  onViewLastReport: () => void;
  onCompareWithSelf: () => void;
  onSharedInput: (payload: SharedPayload | null) => void;
  onDeclineInvite: () => void;
}

const total = assessmentQuestions.length;

const steps = [
  {
    icon: PenLine,
    title: 'Answer privately',
    body: 'Rate each topic for how much it matters to you and how flexible you are. No one sees your answers yet.',
  },
  {
    icon: Send,
    title: 'Send your partner a link',
    body: 'Your answers travel sealed inside the link. Your partner answers the same questions on their own device.',
  },
  {
    icon: HeartHandshake,
    title: 'Read your joint report',
    body: 'See every answer side by side, where you align, and a guided plan for the conversations that matter most.',
  },
];

const reportFeatures = [
  { icon: Scale, title: 'Compatibility Index', body: 'A 0 to 100 score weighted toward the topics you both care about most.' },
  { icon: SplitSquareHorizontal, title: 'Side-by-side answers', body: 'Every question, both partners, filterable by life area and status.' },
  { icon: MessagesSquare, title: 'Conversation guide', body: 'Counselor-style prompts for your priority topics, in the order to discuss them.' },
  { icon: FileText, title: 'Printable PDF report', body: 'A polished report to bring to a premarital counselor or keep for yourselves.' },
];

const trustPoints = [
  { icon: Lock, label: 'No accounts, no server' },
  { icon: Smartphone, label: 'Each on your own device' },
  { icon: Clock, label: 'About 20 minutes each' },
];

const HeroArt = () => (
  <div className="relative mx-auto w-full max-w-md py-8" aria-hidden="true">
    <div className="orb -left-10 top-4 h-56 w-56 bg-primary/25" />
    <div className="orb -right-6 bottom-0 h-64 w-64 bg-accent/30" />
    <BrandMark className="absolute -right-4 -top-2 h-44 w-auto animate-spin-slow opacity-[0.08]" />

    <div className="surface relative p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Joint report preview</p>
        <div className="flex -space-x-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-partner-a font-display text-sm font-semibold text-primary-foreground ring-2 ring-card">
            A
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-partner-b font-display text-sm font-semibold text-primary-foreground ring-2 ring-card">
            R
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-gradient font-display text-7xl font-semibold leading-none">82</div>
          <div className="mt-1 text-xs text-muted-foreground">Compatibility Index</div>
        </div>
        <StatusChip status="aligned" className="text-[0.7rem]" />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="brand-gradient h-full w-[82%] rounded-full" />
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {(
          [
            ['Core Values & Ethics', 'aligned'],
            ['Finances', 'discuss'],
            ['Children & Parenting', 'confirm'],
            ['Family of Origin & In-Laws', 'priority'],
          ] as const
        ).map(([label, status]) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <CategoryIcon category={label} size="xs" />
              <span className="truncate text-foreground/80">{label}</span>
            </span>
            <StatusChip status={status} short />
          </li>
        ))}
      </ul>
    </div>

    <div className="surface absolute -left-6 top-0 hidden animate-float items-center gap-2.5 px-3.5 py-2.5 sm:flex">
      <CategoryIcon category="Core Values & Ethics" size="sm" />
      <div className="text-xs">
        <p className="font-semibold">Aligned on values</p>
        <p className="text-muted-foreground">6 of 6 questions</p>
      </div>
    </div>

    <div
      className="surface absolute -bottom-12 -right-4 hidden max-w-[15rem] animate-float items-start gap-2.5 px-3.5 py-3 sm:flex"
      style={{ animationDelay: '-3s' }}
    >
      <span className="icon-tile h-8 w-8 rounded-lg bg-accent-soft text-accent-ink">
        <MessageSquareQuote className="h-4 w-4" />
      </span>
      <p className="text-xs leading-relaxed text-muted-foreground">
        "When a family member criticises one of us, how should the other respond?"
      </p>
    </div>
  </div>
);

const AssessmentLanding = ({
  inviter,
  draft,
  hasSealed,
  hasLastReport,
  canCompareWithSelf,
  onStart,
  onResume,
  onDiscardDraft,
  onViewSealed,
  onViewLastReport,
  onCompareWithSelf,
  onSharedInput,
  onDeclineInvite,
}: AssessmentLandingProps) => {
  const [sharedInput, setSharedInput] = useState('');

  return (
    <div className="paper min-h-screen overflow-x-hidden">
      <SiteHeader
        className="sticky top-0 z-30"
        right={
          <Button asChild variant="ghost" size="sm">
            <Link to="/contact">Contact</Link>
          </Button>
        }
      />

      <main>
        {(draft || hasSealed || hasLastReport) && !inviter && (
          <div className="container pt-6">
            <div className="flex flex-col gap-3">
              {draft && (
                <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="icon-tile h-10 w-10 bg-primary-soft text-primary">
                      <PenLine className="h-5 w-5" />
                    </span>
                    <div className="text-sm">
                      <p className="font-medium">Welcome back, {draft.name}.</p>
                      <p className="text-muted-foreground">
                        You have answered {draft.responses.length} of {total} questions.
                      </p>
                      <div className="mt-1.5 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                        <div
                          className="brand-gradient h-full rounded-full"
                          style={{ width: `${(draft.responses.length / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={onDiscardDraft}>
                      Discard
                    </Button>
                    <Button size="sm" onClick={onResume}>
                      Resume <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {(hasSealed || hasLastReport) && (
                <div className="flex flex-wrap gap-2">
                  {hasSealed && (
                    <Button size="sm" variant="outline" onClick={onViewSealed}>
                      <Link2 className="mr-1.5 h-4 w-4" /> Your invite link
                    </Button>
                  )}
                  {hasLastReport && (
                    <Button size="sm" variant="outline" onClick={onViewLastReport}>
                      <FileText className="mr-1.5 h-4 w-4" /> Open your last joint report
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="container grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            {inviter ? (
              <>
                <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
                  <Send className="h-3.5 w-3.5" /> A private invitation
                </p>
                <h1 className="mt-5 text-5xl font-semibold leading-[1.05] text-primary sm:text-6xl">
                  {inviter.name} has answered.
                  <span className="text-gradient block pb-1 italic">Now it is your turn.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {inviter.name} completed the premarital assessment and sealed their answers in this link. Answer the
                  same {total} questions honestly. The moment you finish, you will both see a joint report with your
                  answers side by side.
                </p>
              </>
            ) : (
              <>
                <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
                  <HeartHandshake className="h-3.5 w-3.5" /> Premarital compatibility assessment
                </p>
                <h1 className="mt-5 text-5xl font-semibold leading-[1.05] text-primary sm:text-6xl lg:text-7xl">
                  Know each other's answers
                  <span className="text-gradient block pb-1 italic">before you say yes.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  A counselor-style assessment for engaged and serious couples. Each of you answers privately, then you
                  read one joint report that shows where you align, where you differ, and how to talk about it.
                </p>
              </>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {canCompareWithSelf ? (
                <Button size="lg" className="h-12 px-6 shadow-lg shadow-primary/20" onClick={onCompareWithSelf}>
                  Open our joint report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" className="group h-12 px-6 shadow-lg shadow-primary/20" onClick={() => onStart('text')}>
                  Begin the assessment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              <Button size="lg" variant="outline" className="h-12 bg-card/60 px-6" onClick={() => onStart('voice')}>
                <Mic className="mr-2 h-4 w-4" /> Answer by voice
              </Button>
            </div>

            {canCompareWithSelf && (
              <p className="mt-3 text-sm text-muted-foreground">
                You have already answered on this device, so your report is ready.{' '}
                <button className="underline underline-offset-4" onClick={() => onStart('text')}>
                  Answer again instead
                </button>
              </p>
            )}

            {inviter && (
              <p className="mt-4 text-sm text-muted-foreground">
                Not {inviter.name}'s partner?{' '}
                <button className="underline underline-offset-4 hover:text-foreground" onClick={onDeclineInvite}>
                  Start your own assessment
                </button>
              </p>
            )}

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {trustPoints.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent-ink" /> {label}
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                [String(total), 'questions'],
                [String(assessmentCategories.length), 'life areas'],
                ['4', 'statuses'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-4xl font-semibold text-primary">{value}</dd>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
            <HeroArt />
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border/70 bg-card/60">
          <div className="container py-16 md:py-20">
            <div className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 text-4xl font-semibold text-primary">Three steps, two devices, one honest picture</h2>
            </div>
            <div className="relative mt-12">
              <div
                className="absolute left-[8%] right-[8%] top-8 hidden h-px border-t-2 border-dashed border-accent/40 md:block"
                aria-hidden="true"
              />
              <ol className="relative grid gap-8 md:grid-cols-3">
                {steps.map(({ icon: Icon, title, body }, i) => (
                  <li key={title} className="relative">
                    <div className="relative flex items-center gap-3">
                      <span className="icon-tile brand-gradient h-16 w-16 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                      </span>
                      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Two ratings */}
        <section className="container grid gap-12 py-16 md:py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The method</p>
            <h2 className="mt-3 text-4xl font-semibold text-primary">Two ratings tell us more than one</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Most quizzes only ask whether you agree. Counselors look at two things: how much a topic matters to each
              of you, and how much room each of you has to move. A big difference on something one partner will not
              bend on is very different from a difference you can both adapt to.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Gauge, label: 'Importance, 1 to 5', q: 'How much does this matter to me?', hint: 'From "not important" to "extremely important".', fill: 4 },
              { icon: MoveHorizontal, label: 'Flexibility, 1 to 5', q: 'How much room do I have to adapt?', hint: 'From "very flexible" to "non-negotiable".', fill: 2 },
            ].map(({ icon: Icon, label, q, hint, fill }) => (
              <div key={label} className="surface lift p-6">
                <span className="icon-tile h-11 w-11 bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="eyebrow mt-4">{label}</p>
                <p className="mt-2 font-display text-2xl font-semibold">{q}</p>
                <div className="mt-3 flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= fill ? 'brand-gradient' : 'bg-muted'}`} />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{hint}</p>
              </div>
            ))}
            <div className="surface p-6 sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                <StatusChip status="aligned" />
                <StatusChip status="discuss" />
                <StatusChip status="priority" />
                <StatusChip status="confirm" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every question in your report gets one of four statuses. "Confirm your stance" flags topics you both call
                essential and non-negotiable, so you can check you hold the same position, not opposite ones.
              </p>
            </div>
          </div>
        </section>

        {/* Report features */}
        <section className="relative overflow-hidden bg-band text-band-foreground">
          <div className="orb -right-24 -top-24 h-80 w-80 bg-accent/30" aria-hidden="true" />
          <div className="orb -bottom-32 left-10 h-72 w-72 bg-partner-b/25" aria-hidden="true" />
          <div className="container relative py-16 md:py-20">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">What you receive</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-semibold">A report written the way a counselor would read your answers</h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reportFeatures.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-band-foreground/15 bg-band-foreground/[0.06] p-6 backdrop-blur-sm transition-colors hover:bg-band-foreground/[0.1]"
                >
                  <span className="icon-tile h-12 w-12 bg-accent text-accent-foreground">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-band-foreground/75">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Life areas */}
        <section className="container py-16 md:py-20">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">The {assessmentCategories.length} life areas</p>
              <h2 className="mt-3 text-4xl font-semibold text-primary">What you will talk about</h2>
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 text-priority" /> High-stakes areas counselors review first
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessmentCategories.map((category) => {
              const count = assessmentQuestions.filter((q) => q.category === category).length;
              return (
                <li key={category} className="surface lift flex gap-4 p-5">
                  <CategoryIcon category={category} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{category}</span>
                      {highStakesCategories.has(category) && (
                        <Flag className="h-3.5 w-3.5 shrink-0 text-priority" aria-label="High-stakes area" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {discussionGuides[category]?.why}
                    </p>
                    <p className="mt-2 text-xs font-medium text-accent-ink">
                      {count} {count === 1 ? 'question' : 'questions'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Paste link + privacy */}
        <section className="container grid gap-6 pb-20 lg:grid-cols-2">
          <form
            className="surface p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              onSharedInput(parseSharedInput(sharedInput));
            }}
          >
            <span className="icon-tile h-11 w-11 bg-primary-soft text-primary">
              <Link2 className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-4">Already have a link?</p>
            <h3 className="mt-2 text-2xl font-semibold">Open your partner's invite or report</h3>
            <p className="mt-2 text-sm text-muted-foreground">Paste the full link or the code your partner sent you.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Input
                value={sharedInput}
                onChange={(e) => setSharedInput(e.target.value)}
                placeholder="https://...#invite=..."
                aria-label="Invite link or code"
                className="h-11"
              />
              <Button type="submit" className="h-11" disabled={!sharedInput.trim()}>
                Open
              </Button>
            </div>
          </form>

          <div className="surface relative overflow-hidden p-6 sm:p-8">
            <div className="orb -right-10 -top-10 h-40 w-40 bg-aligned/20" aria-hidden="true" />
            <span className="icon-tile relative h-11 w-11 bg-aligned-soft text-aligned">
              <Lock className="h-5 w-5" />
            </span>
            <h3 className="relative mt-4 text-2xl font-semibold">Private by design</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
              There are no accounts and no server storing your answers. Progress is saved only in this browser, and your
              answers travel inside the link you choose to send. Links are encoded rather than encrypted, so share them
              only with your partner.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="container flex flex-col gap-2 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p className="flex items-center gap-2">
            <BrandMark className="h-4" /> Before You Say Yes is a conversation tool, not a substitute for professional
            counseling.
          </p>
          <Link to="/contact" className="underline-offset-4 hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default AssessmentLanding;
