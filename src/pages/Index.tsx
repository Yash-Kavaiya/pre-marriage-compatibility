import { useCallback, useEffect, useState } from 'react';
import AssessmentLanding from '@/components/AssessmentLanding';
import QuestionCard from '@/components/QuestionCard';
import VoiceAssessment from '@/components/VoiceAssessment';
import NameDialog from '@/components/NameDialog';
import ShareInvite from '@/components/ShareInvite';
import JointReport from '@/components/report/JointReport';
import { assessmentQuestions } from '@/data/assessmentQuestions';
import type { AssessmentResponse, PartnerData } from '@/lib/types';
import {
  SharedPayload,
  buildInviteUrl,
  decodePartner,
  encodePartner,
  readSharedPayloadFromHash,
  reportHash,
  setHash,
} from '@/lib/shareLink';
import {
  Draft,
  clearAll,
  clearDraft,
  loadDraft,
  loadReport,
  loadSelf,
  saveDraft,
  saveReport,
  saveSelf,
} from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

type Screen = 'landing' | 'assessment' | 'voice' | 'sealed' | 'report';
type Mode = 'text' | 'voice';
type Answers = Record<number, { importance: number; flexibility: number }>;

const toResponses = (answers: Answers): AssessmentResponse[] =>
  assessmentQuestions
    .map((q) => ({ questionId: q.id, ...(answers[q.id] ?? { importance: 0, flexibility: 0 }) }))
    .filter((r) => r.importance > 0 && r.flexibility > 0);

const toAnswers = (responses: AssessmentResponse[]): Answers =>
  Object.fromEntries(responses.map((r) => [r.questionId, { importance: r.importance, flexibility: r.flexibility }]));

const Index = () => {
  const { toast } = useToast();
  const [screen, setScreen] = useState<Screen>('landing');
  const [inviter, setInviter] = useState<PartnerData | null>(null);
  const [self, setSelf] = useState<PartnerData | null>(() => loadSelf());
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft());
  const [lastReport, setLastReport] = useState(() => loadReport());
  const [report, setReport] = useState<{ partnerA: PartnerData; partnerB: PartnerData } | null>(null);

  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [nameDialog, setNameDialog] = useState<{ open: boolean; mode: Mode }>({ open: false, mode: 'text' });

  const openReport = useCallback((partnerA: PartnerData, partnerB: PartnerData) => {
    setReport({ partnerA, partnerB });
    saveReport(partnerA, partnerB);
    setLastReport({ partnerA, partnerB });
    setHash(reportHash(partnerA, partnerB));
    setScreen('report');
  }, []);

  const applyPayload = useCallback(
    (payload: SharedPayload | null) => {
      if (!payload) return false;
      if (payload.kind === 'report') {
        openReport(payload.partnerA, payload.partnerB);
      } else {
        setInviter(payload.partner);
        setScreen('landing');
      }
      return true;
    },
    [openReport],
  );

  useEffect(() => {
    applyPayload(readSharedPayloadFromHash());
    const onHashChange = () => applyPayload(readSharedPayloadFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [applyPayload]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  useEffect(() => {
    if (screen !== 'assessment') return;
    const next: Draft = {
      name,
      responses: toResponses(answers),
      questionIndex,
      inviteCode: inviter ? encodePartner(inviter) : undefined,
    };
    saveDraft(next);
    setDraft(next);
  }, [screen, name, answers, questionIndex, inviter]);

  const beginAssessment = (partnerName: string, mode: Mode) => {
    setNameDialog((d) => ({ ...d, open: false }));
    setName(partnerName);
    setAnswers({});
    setQuestionIndex(0);
    setScreen(mode === 'voice' ? 'voice' : 'assessment');
  };

  const resumeDraft = () => {
    if (!draft) return;
    setName(draft.name);
    setAnswers(toAnswers(draft.responses));
    setQuestionIndex(Math.min(draft.questionIndex, assessmentQuestions.length - 1));
    if (draft.inviteCode) setInviter(decodePartner(draft.inviteCode));
    setScreen('assessment');
  };

  const discardDraft = () => {
    clearDraft();
    setDraft(null);
  };

  const finish = (responses: AssessmentResponse[]) => {
    const partner: PartnerData = { name, responses, completedAt: new Date() };
    clearDraft();
    setDraft(null);

    if (inviter) {
      toast({ title: 'Both assessments are in', description: `Here is your joint report with ${inviter.name}.` });
      openReport(inviter, partner);
      return;
    }

    saveSelf(partner);
    setSelf(partner);
    setHash('');
    setScreen('sealed');
  };

  const setAnswer = (field: 'importance' | 'flexibility', value: number) => {
    const id = assessmentQuestions[questionIndex].id;
    setAnswers((prev) => ({
      ...prev,
      [id]: { importance: 0, flexibility: 0, ...prev[id], [field]: value },
    }));
  };

  const goNext = () => {
    if (questionIndex < assessmentQuestions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      finish(toResponses(answers));
    }
  };

  const startOver = () => {
    clearAll();
    setHash('');
    setSelf(null);
    setDraft(null);
    setReport(null);
    setLastReport(null);
    setInviter(null);
    setAnswers({});
    setQuestionIndex(0);
    setScreen('landing');
  };

  const handlePartnerPayload = (payload: SharedPayload | null) => {
    if (!payload) {
      toast({
        title: 'That link did not work',
        description: 'Paste the full link or code your partner sent you.',
        variant: 'destructive',
      });
      return;
    }
    if (payload.kind === 'invite' && self) {
      openReport(payload.partner, self);
      return;
    }
    applyPayload(payload);
  };

  if (screen === 'report' && report) {
    return <JointReport partnerA={report.partnerA} partnerB={report.partnerB} onStartOver={startOver} />;
  }

  if (screen === 'sealed' && self) {
    return (
      <ShareInvite
        partner={self}
        inviteUrl={buildInviteUrl(self)}
        onPartnerLink={handlePartnerPayload}
        onHome={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'voice') {
    return (
      <VoiceAssessment
        partnerName={name}
        onComplete={(responses) => finish(toResponses(toAnswers(responses)))}
        onCancel={() => setScreen('landing')}
      />
    );
  }

  if (screen === 'assessment') {
    const question = assessmentQuestions[questionIndex];
    const current = answers[question.id] ?? { importance: 0, flexibility: 0 };
    return (
      <QuestionCard
        question={question}
        questionIndex={questionIndex}
        partnerName={name}
        answeredCount={toResponses(answers).length}
        importance={current.importance}
        flexibility={current.flexibility}
        onImportanceChange={(v) => setAnswer('importance', v)}
        onFlexibilityChange={(v) => setAnswer('flexibility', v)}
        onNext={goNext}
        onPrevious={() => setQuestionIndex((i) => Math.max(0, i - 1))}
        onExit={() => setScreen('landing')}
      />
    );
  }

  return (
    <>
      <AssessmentLanding
        inviter={inviter}
        draft={draft}
        hasSealed={!!self}
        hasLastReport={!!lastReport}
        canCompareWithSelf={!!inviter && !!self && encodePartner(inviter) !== encodePartner(self)}
        onStart={(mode) => setNameDialog({ open: true, mode })}
        onResume={resumeDraft}
        onDiscardDraft={discardDraft}
        onViewSealed={() => setScreen('sealed')}
        onViewLastReport={() => lastReport && openReport(lastReport.partnerA, lastReport.partnerB)}
        onCompareWithSelf={() => inviter && self && openReport(inviter, self)}
        onSharedInput={handlePartnerPayload}
        onDeclineInvite={() => {
          setInviter(null);
          setHash('');
        }}
      />
      <NameDialog
        open={nameDialog.open}
        mode={nameDialog.mode}
        inviterName={inviter?.name}
        onOpenChange={(open) => setNameDialog((d) => ({ ...d, open }))}
        onSubmit={(partnerName) => beginAssessment(partnerName, nameDialog.mode)}
      />
    </>
  );
};

export default Index;
