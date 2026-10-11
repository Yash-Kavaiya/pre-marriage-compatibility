import { useMemo, useState } from 'react';
import {
  Calculator,
  CalendarDays,
  Check,
  Columns2,
  Download,
  Heart,
  LayoutDashboard,
  Link2,
  MessagesSquare,
  MoveHorizontal,
  Radar,
  RotateCcw,
  UserRound,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import SiteHeader from '@/components/SiteHeader';
import { buildCompatibilityReport, statusMeta, statusOrder } from '@/lib/compatibility';
import { cn } from '@/lib/utils';
import { buildReportUrl } from '@/lib/shareLink';
import type { PartnerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import AnswerComparison from './AnswerComparison';
import CategoryOverview from './CategoryOverview';
import ConversationGuide from './ConversationGuide';
import ExecutiveSummary from './ExecutiveSummary';
import FlexibilityDynamics from './FlexibilityDynamics';
import IndividualProfile from './IndividualProfile';
import Methodology from './Methodology';
import { PartnerAvatar, SectionHeading } from './primitives';
import { statusClasses, statusIcons } from './statusStyles';

interface JointReportProps {
  partnerA: PartnerData;
  partnerB: PartnerData;
  onStartOver: () => void;
}

const sections = [
  ['summary', 'Summary', LayoutDashboard],
  ['areas', 'Life areas', Radar],
  ['guide', 'Conversation guide', MessagesSquare],
  ['answers', 'Side by side', Columns2],
  ['flexibility', 'Flexibility', MoveHorizontal],
  ['profiles', 'Profiles', UserRound],
  ['method', 'Method', Calculator],
] as const;

const formatDate = (date: Date) => date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

const JointReport = ({ partnerA, partnerB, onStartOver }: JointReportProps) => {
  const { toast } = useToast();
  const report = useMemo(() => buildCompatibilityReport(partnerA, partnerB), [partnerA, partnerB]);
  const [linkCopied, setLinkCopied] = useState(false);

  const runPdf = async (build: (pdf: typeof import('@/utils/pdfGenerator')) => void) => {
    try {
      build(await import('@/utils/pdfGenerator'));
    } catch {
      toast({ title: 'Could not create the PDF', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const downloadPdf = () => runPdf((pdf) => pdf.generatePDFReport(partnerA, partnerB));
  const downloadIndividual = (partner: PartnerData) => runPdf((pdf) => pdf.generateSinglePartnerPDF(partner));

  const copyReportLink = async () => {
    try {
      await navigator.clipboard.writeText(buildReportUrl(partnerA, partnerB));
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
      toast({ title: 'Report link copied', description: 'Send it to your partner so they can read the same report.' });
    } catch {
      toast({ title: 'Could not copy', description: 'Copy the address from your browser bar instead.', variant: 'destructive' });
    }
  };

  return (
    <div className="paper min-h-screen">
      <SiteHeader
        className="sticky top-0 z-20"
        right={
          <>
            <Button variant="ghost" size="sm" onClick={copyReportLink} className="hidden sm:inline-flex">
              {linkCopied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
              Share with partner
            </Button>
            <Button size="sm" onClick={downloadPdf}>
              <Download className="mr-2 h-4 w-4" /> PDF report
            </Button>
          </>
        }
      />

      <main className="container max-w-6xl pb-24">
        {/* Cover */}
        <section className="surface mesh relative my-10 overflow-hidden p-8 md:my-14 md:p-14">
          <div className="orb -right-20 -top-20 h-72 w-72 bg-accent/20" aria-hidden="true" />
          <div className="relative flex items-center">
            <PartnerAvatar name={partnerA.name} partner="a" size="lg" className="animate-pop-in" />
            <span
              className="icon-tile brand-gradient z-10 -mx-3 h-12 w-12 animate-pop-in rounded-full text-primary-foreground shadow-lg ring-4 ring-card"
              style={{ animationDelay: '150ms' }}
              aria-hidden="true"
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </span>
            <PartnerAvatar
              name={partnerB.name}
              partner="b"
              size="lg"
              className="animate-pop-in [animation-delay:300ms]"
            />
          </div>
          <p className="eyebrow relative mt-8">Joint compatibility report</p>
          <h1 className="relative mt-3 text-5xl font-semibold leading-[1.05] text-primary sm:text-7xl">
            {partnerA.name} <span className="text-gradient italic">&amp;</span> {partnerB.name}
          </h1>
          <p className="relative mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A private reading of your answers across {report.categories.length} life areas. Read it together, slowly,
            and treat every difference as a question rather than a verdict.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-border">
              <span className="text-gradient font-display text-2xl leading-none">{Math.round(report.index)}</span>
              <span className="text-muted-foreground">Compatibility Index</span>
            </span>
            {statusOrder
              .slice()
              .reverse()
              .filter((s) => report.counts[s] > 0)
              .map((s) => {
                const Icon = statusIcons[s];
                return (
                  <span
                    key={s}
                    className={cn('status-chip px-3 py-1.5 text-sm', statusClasses[s].soft, statusClasses[s].text)}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {report.counts[s]} {statusMeta[s].short.toLowerCase()}
                  </span>
                );
              })}
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> {formatDate(new Date())}
            </span>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2 sm:hidden">
            <Button variant="outline" size="sm" onClick={copyReportLink}>
              <Link2 className="mr-2 h-4 w-4" /> Share with partner
            </Button>
          </div>
        </section>

        <nav
          aria-label="Report sections"
          className="sticky top-16 z-10 -mx-6 mb-12 overflow-x-auto border-y border-border/70 bg-background/90 px-6 backdrop-blur"
        >
          <ul className="flex gap-2 whitespace-nowrap py-2.5 text-sm">
            {sections.map(([id, label, Icon]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-24">
          <ExecutiveSummary report={report} />
          <CategoryOverview report={report} />
          <ConversationGuide report={report} />
          <AnswerComparison report={report} />
          <FlexibilityDynamics report={report} />

          <section className="space-y-8">
            <SectionHeading
              id="profiles"
              eyebrow="06 / Individual profiles"
              icon={UserRound}
              title="Each of you, on your own terms"
              description="How clearly each of you knows your own priorities, and how you tend to hold them. Clarity is a good predictor of how easily the conversations ahead will go."
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <IndividualProfile partner={partnerA} accent="a" onDownload={() => downloadIndividual(partnerA)} />
              <IndividualProfile partner={partnerB} accent="b" onDownload={() => downloadIndividual(partnerB)} />
            </div>
          </section>

          <Methodology />

          <section className="surface mesh flex flex-col items-start gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="icon-tile brand-gradient mb-4 h-11 w-11 text-primary-foreground shadow-md">
                <Heart className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-3xl font-semibold text-primary">Keep this conversation going</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Download the PDF to bring to a counselor, and retake the assessment in six months to see how your answers
                move.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadPdf}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" /> Start over
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-2xl">Start a new assessment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This clears the saved answers and report from this device. Anyone with the report link can still
                      open it, so download the PDF first if you want to keep a copy.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep this report</AlertDialogCancel>
                    <AlertDialogAction onClick={onStartOver}>Clear and start over</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default JointReport;
