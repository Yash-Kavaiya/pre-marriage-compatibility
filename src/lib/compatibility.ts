import { assessmentCategories, assessmentQuestions, Question } from '@/data/assessmentQuestions';
import type { AssessmentResponse, PartnerData } from '@/lib/types';

export type Status = 'aligned' | 'discuss' | 'priority' | 'confirm';

export const statusOrder: Status[] = ['priority', 'confirm', 'discuss', 'aligned'];

export const statusMeta: Record<Status, { label: string; short: string; description: string; rgb: [number, number, number] }> = {
  aligned: {
    label: 'Aligned',
    short: 'Aligned',
    description: 'You give this topic similar weight. Expect it to be easy to navigate together.',
    rgb: [74, 120, 92],
  },
  discuss: {
    label: 'Worth discussing',
    short: 'Discuss',
    description: 'A noticeable difference in weight, with room on at least one side to adapt.',
    rgb: [184, 125, 30],
  },
  priority: {
    label: 'Priority conversation',
    short: 'Priority',
    description: 'A large difference in weight, or a gap where the partner who cares more is not flexible.',
    rgb: [186, 86, 58],
  },
  confirm: {
    label: 'Confirm your stance',
    short: 'Confirm',
    description: 'You both rate this as essential and non-negotiable. Make sure you are holding the same position, not opposite ones.',
    rgb: [76, 104, 150],
  },
};

export const highStakesCategories = new Set([
  'Children & Parenting',
  'Finances',
  'Religion',
  'Relationship Model & Boundaries',
  'Family of Origin & In-Laws',
]);

export interface QuestionComparison {
  question: Question;
  a: AssessmentResponse;
  b: AssessmentResponse;
  status: Status;
  importanceGap: number;
  score: number;
  weight: number;
}

export interface CategoryResult {
  category: string;
  highStakes: boolean;
  items: QuestionComparison[];
  score: number;
  status: Exclude<Status, 'confirm'>;
  counts: Record<Status, number>;
  importanceA: number;
  importanceB: number;
  flexibilityA: number;
  flexibilityB: number;
  moreFlexible: 'A' | 'B' | 'balanced';
}

export type Band = 'strong' | 'solid' | 'significant';

export const bandMeta: Record<Band, { label: string; summary: string }> = {
  strong: {
    label: 'Strong foundation',
    summary: 'Your priorities line up across most of the areas that shape a marriage.',
  },
  solid: {
    label: 'Solid, with growth areas',
    summary: 'You share a good base, with a handful of areas that deserve deliberate conversation.',
  },
  significant: {
    label: 'Significant differences to work through',
    summary: 'Several important areas show real gaps. These are workable, but they need structured conversation, ideally with a counselor.',
  },
};

export interface FlexibilitySummary {
  aMoreFlexible: number;
  bMoreFlexible: number;
  balanced: number;
  carrier: 'A' | 'B' | null;
  avgFlexA: number;
  avgFlexB: number;
}

export interface CompatibilityReport {
  partnerA: PartnerData;
  partnerB: PartnerData;
  items: QuestionComparison[];
  categories: CategoryResult[];
  index: number;
  band: Band;
  counts: Record<Status, number>;
  strengths: CategoryResult[];
  sharedPriorities: QuestionComparison[];
  priorities: QuestionComparison[];
  confirmItems: QuestionComparison[];
  flexibility: FlexibilitySummary;
  narrative: string;
}

const average = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

const emptyCounts = (): Record<Status, number> => ({ aligned: 0, discuss: 0, priority: 0, confirm: 0 });

export const getStatus = (a: AssessmentResponse, b: AssessmentResponse): Status => {
  const gap = Math.abs(a.importance - b.importance);

  if (gap <= 1) {
    const bothEssential = Math.min(a.importance, b.importance) >= 4;
    const bothFirm = Math.min(a.flexibility, b.flexibility) >= 4;
    return bothEssential && bothFirm ? 'confirm' : 'aligned';
  }

  if (gap === 2) {
    const caresMore = a.importance > b.importance ? a : b;
    return caresMore.flexibility >= 4 ? 'priority' : 'discuss';
  }

  return Math.max(a.flexibility, b.flexibility) <= 2 ? 'discuss' : 'priority';
};

const getQuestionScore = (a: AssessmentResponse, b: AssessmentResponse, status: Status) => {
  const gap = Math.abs(a.importance - b.importance);
  const rigidityPenalty = gap >= 2 ? (Math.max(a.flexibility, b.flexibility) - 1) * 5 : 0;
  const score = 100 - gap * 20 - rigidityPenalty;
  return Math.max(0, Math.min(status === 'confirm' ? 85 : 100, score));
};

const weightedScore = (items: QuestionComparison[]) => {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  if (!totalWeight) return 0;
  return items.reduce((sum, i) => sum + i.score * i.weight, 0) / totalWeight;
};

const getBand = (index: number): Band => (index >= 80 ? 'strong' : index >= 65 ? 'solid' : 'significant');

const categoryStatus = (score: number): CategoryResult['status'] =>
  score >= 80 ? 'aligned' : score >= 65 ? 'discuss' : 'priority';

const priorityRank = (item: QuestionComparison) =>
  (highStakesCategories.has(item.question.category) ? 100 : 0) + item.importanceGap * 10 + item.weight;

const buildNarrative = (report: Omit<CompatibilityReport, 'narrative'>) => {
  const { partnerA, partnerB, band, index, counts, strengths, categories, flexibility, items } = report;
  const a = partnerA.name;
  const b = partnerB.name;
  const parts: string[] = [];

  parts.push(
    `${a} and ${b} reach a Compatibility Index of ${Math.round(index)} out of 100, which places you in the "${bandMeta[band].label}" range. ${bandMeta[band].summary}`,
  );

  const alignedShare = Math.round(((counts.aligned + counts.confirm) / Math.max(items.length, 1)) * 100);
  parts.push(`About ${alignedShare}% of the topics you rated carry similar weight for both of you.`);

  if (strengths.length) {
    parts.push(
      `Your clearest common ground is in ${strengths.slice(0, 2).map((s) => s.category).join(' and ')}.`,
    );
  }

  const weakest = [...categories].sort((x, y) => x.score - y.score)[0];
  if (weakest && weakest.score < 80) {
    parts.push(
      `The area that most needs attention is ${weakest.category}${weakest.highStakes ? ', which is one of the high-stakes areas counselors look at first' : ''}.`,
    );
  }

  if (counts.confirm > 0) {
    parts.push(
      `There ${counts.confirm === 1 ? 'is 1 topic' : `are ${counts.confirm} topics`} you both treat as essential and non-negotiable; take a moment to confirm you are holding the same position on ${counts.confirm === 1 ? 'it' : 'them'}.`,
    );
  }

  if (flexibility.carrier) {
    const carrier = flexibility.carrier === 'A' ? a : b;
    parts.push(
      `${carrier} is the more flexible partner in most areas. That can work well, but watch that compromise does not always flow in one direction.`,
    );
  }

  return parts.join(' ');
};

export const buildCompatibilityReport = (partnerA: PartnerData, partnerB: PartnerData): CompatibilityReport => {
  const byIdA = new Map(partnerA.responses.map((r) => [r.questionId, r]));
  const byIdB = new Map(partnerB.responses.map((r) => [r.questionId, r]));

  const items: QuestionComparison[] = [];
  for (const question of assessmentQuestions) {
    const a = byIdA.get(question.id);
    const b = byIdB.get(question.id);
    if (!a || !b || !a.importance || !b.importance) continue;
    const status = getStatus(a, b);
    items.push({
      question,
      a,
      b,
      status,
      importanceGap: Math.abs(a.importance - b.importance),
      score: getQuestionScore(a, b, status),
      weight: (a.importance + b.importance) / 2,
    });
  }

  const categories: CategoryResult[] = assessmentCategories
    .map((category) => {
      const catItems = items.filter((i) => i.question.category === category);
      if (!catItems.length) return null;
      const counts = emptyCounts();
      catItems.forEach((i) => counts[i.status]++);
      const score = weightedScore(catItems);
      const flexibilityA = average(catItems.map((i) => i.a.flexibility));
      const flexibilityB = average(catItems.map((i) => i.b.flexibility));
      const flexDelta = flexibilityB - flexibilityA;
      return {
        category,
        highStakes: highStakesCategories.has(category),
        items: catItems,
        score,
        status: categoryStatus(score),
        counts,
        importanceA: average(catItems.map((i) => i.a.importance)),
        importanceB: average(catItems.map((i) => i.b.importance)),
        flexibilityA,
        flexibilityB,
        moreFlexible: Math.abs(flexDelta) < 0.75 ? 'balanced' : flexDelta > 0 ? 'A' : 'B',
      } satisfies CategoryResult;
    })
    .filter((c): c is CategoryResult => c !== null);

  const counts = emptyCounts();
  items.forEach((i) => counts[i.status]++);

  const index = weightedScore(items);

  const strengths = [...categories]
    .filter((c) => c.score >= 80)
    .sort((x, y) => y.score * (y.importanceA + y.importanceB) - x.score * (x.importanceA + x.importanceB))
    .slice(0, 3);

  const sharedPriorities = items
    .filter((i) => i.status === 'aligned' && Math.min(i.a.importance, i.b.importance) >= 4)
    .sort((x, y) => y.weight - x.weight);

  const priorities = items
    .filter((i) => i.status === 'priority')
    .sort((x, y) => priorityRank(y) - priorityRank(x));

  const confirmItems = items
    .filter((i) => i.status === 'confirm')
    .sort((x, y) => priorityRank(y) - priorityRank(x));

  const aMoreFlexible = categories.filter((c) => c.moreFlexible === 'A').length;
  const bMoreFlexible = categories.filter((c) => c.moreFlexible === 'B').length;
  const decided = aMoreFlexible + bMoreFlexible;
  const carrier =
    decided >= 4 && aMoreFlexible / decided >= 0.7 ? 'A' : decided >= 4 && bMoreFlexible / decided >= 0.7 ? 'B' : null;

  const flexibility: FlexibilitySummary = {
    aMoreFlexible,
    bMoreFlexible,
    balanced: categories.length - decided,
    carrier,
    avgFlexA: average(items.map((i) => i.a.flexibility)),
    avgFlexB: average(items.map((i) => i.b.flexibility)),
  };

  const base = {
    partnerA,
    partnerB,
    items,
    categories,
    index,
    band: getBand(index),
    counts,
    strengths,
    sharedPriorities,
    priorities,
    confirmItems,
    flexibility,
  };

  return { ...base, narrative: buildNarrative(base) };
};
