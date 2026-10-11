import { useState } from 'react';
import {
  Check,
  Copy,
  HeartHandshake,
  Link2,
  Mail,
  MessageCircle,
  Share2,
  Smartphone,
  SplitSquareHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SiteHeader from '@/components/SiteHeader';
import IndividualProfile from '@/components/report/IndividualProfile';
import { encodePartner, parseSharedInput, SharedPayload } from '@/lib/shareLink';
import type { PartnerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShareInviteProps {
  partner: PartnerData;
  inviteUrl: string;
  onPartnerLink: (payload: SharedPayload | null) => void;
  onHome: () => void;
}

const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
      return true;
    } catch {
      return false;
    }
  };
  return { copied, copy };
};

const ShareInvite = ({ partner, inviteUrl, onPartnerLink, onHome }: ShareInviteProps) => {
  const { toast } = useToast();
  const { copied, copy } = useCopy();
  const [partnerInput, setPartnerInput] = useState('');
  const code = encodePartner(partner);

  const message = `I just finished our premarital compatibility assessment. Your turn: answer privately here and we will both see our joint report.\n\n${inviteUrl}`;
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleCopy = async (key: string, text: string) => {
    const ok = await copy(key, text);
    if (!ok) toast({ title: 'Could not copy', description: 'Select the text and copy it manually.', variant: 'destructive' });
  };

  return (
    <div className="paper min-h-screen">
      <SiteHeader
        right={
          <Button variant="ghost" size="sm" onClick={onHome}>
            Home
          </Button>
        }
      />

      <main className="container max-w-5xl py-12 md:py-16">
        <section className="animate-fade-up">
          <div className="relative flex h-16 w-16 items-center justify-center" aria-hidden="true">
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-aligned/30" />
            <span className="relative flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-aligned text-background shadow-lg shadow-aligned/30">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-8 rounded-full bg-aligned" />
              <span className="h-1.5 w-8 rounded-full bg-border" />
              <span className="h-1.5 w-8 rounded-full bg-border" />
            </div>
            <p className="eyebrow">Step 1 of 3 complete</p>
          </div>
          <h1 className="mt-3 text-5xl font-semibold leading-tight text-primary">
            Your answers are sealed, {partner.name}.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Send this private link to your partner. They will answer the same {partner.responses.length} questions
            without seeing yours. The moment they finish, the joint report opens for them, and they can send it straight
            back to you.
          </p>
        </section>

        <section className="surface mesh mt-10 p-6 sm:p-8">
          <label htmlFor="invite-url" className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider text-primary">
            <span className="icon-tile brand-gradient h-9 w-9 text-primary-foreground shadow-md">
              <Link2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </span>
            Your partner's private link
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input id="invite-url" readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} className="h-11 font-mono text-xs" />
            <Button className="h-11 shrink-0" onClick={() => handleCopy('link', inviteUrl)}>
              {copied === 'link' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4 text-aligned" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:?subject=${encodeURIComponent('Our premarital assessment: your turn')}&body=${encodeURIComponent(message)}`}>
                <Mail className="mr-2 h-4 w-4" /> Email
              </a>
            </Button>
            {canNativeShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.share({ title: 'Our premarital assessment', text: message }).catch(() => undefined)}
              >
                <Share2 className="mr-2 h-4 w-4" /> More options
              </Button>
            )}
          </div>

          <details className="mt-6 group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Link not opening? Share a code instead
            </summary>
            <div className="mt-3 rounded-lg bg-muted p-4">
              <p className="break-all font-mono text-xs leading-relaxed">{code}</p>
              <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={() => handleCopy('code', code)}>
                {copied === 'code' ? 'Copied' : 'Copy code'}
              </Button>
              <p className="text-xs text-muted-foreground">Your partner pastes it into "Already have a link?" on the home page.</p>
            </div>
          </details>

          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            The link is encoded, not encrypted. Anyone with it could decode your answers, so send it only to your partner.
          </p>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <div className="surface p-6 sm:p-8">
              <p className="eyebrow">What happens next</p>
              <ol className="mt-5 space-y-5 text-sm">
                {[
                  { icon: Smartphone, text: 'Your partner opens the link and answers on their own device.' },
                  { icon: SplitSquareHorizontal, text: 'Their report opens with both sets of answers side by side.' },
                  {
                    icon: HeartHandshake,
                    text: 'They send the report link back so you can read it too, or you sit down and read it together.',
                  },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={text} className="flex gap-3.5">
                    <span className="icon-tile h-10 w-10 bg-accent-soft text-accent-ink">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="leading-relaxed text-muted-foreground">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
                        Step {i + 2}
                      </span>
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <form
              className="surface p-6 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                onPartnerLink(parseSharedInput(partnerInput));
              }}
            >
              <p className="eyebrow">Already have your partner's link?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                If your partner also answered and sent you their invite or report link, paste it to open your joint report.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={partnerInput}
                  onChange={(e) => setPartnerInput(e.target.value)}
                  placeholder="Paste link or code"
                  aria-label="Partner link or code"
                  className="h-11"
                />
                <Button type="submit" variant="outline" className="h-11" disabled={!partnerInput.trim()}>
                  Open report
                </Button>
              </div>
            </form>
          </div>

          <IndividualProfile
            partner={partner}
            onDownload={() =>
              import('@/utils/pdfGenerator')
                .then((pdf) => pdf.generateSinglePartnerPDF(partner))
                .catch(() => toast({ title: 'Could not create the PDF', description: 'Please try again.', variant: 'destructive' }))
            }
          />
        </section>
      </main>
    </div>
  );
};

export default ShareInvite;
