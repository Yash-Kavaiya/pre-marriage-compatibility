import type { AssessmentResponse } from '@/lib/types';
import { assessmentQuestions, assessmentCategories } from '@/data/assessmentQuestions';

export interface QualityOfLifeInsight {
  category: string;
  score: number;
  level: 'excellent' | 'good' | 'moderate' | 'needs_attention';
  insights: string[];
  recommendations: string[];
}

export interface QualityOfLifeReport {
  overallScore: number;
  categoryInsights: QualityOfLifeInsight[];
  strengths: string[];
  growthAreas: string[];
  profileTitle: string;
  personalityProfile: string;
  readinessTitle: string;
  relationshipReadiness: string;
  avgImportance: number;
  avgFlexibility: number;
}

export const levelLabels: Record<QualityOfLifeInsight['level'], string> = {
  excellent: 'Clear and balanced',
  good: 'Clear',
  moderate: 'Developing',
  needs_attention: 'Worth reflecting on',
};

const getQualityLevel = (score: number): QualityOfLifeInsight['level'] => {
  if (score >= 4.5) return 'excellent';
  if (score >= 4.0) return 'good';
  if (score >= 3.0) return 'moderate';
  return 'needs_attention';
};

const getCategoryInsights = (category: string, avgImportance: number, avgFlexibility: number): string[] => {
  const insights: string[] = [];

  if (avgImportance >= 4.5) {
    insights.push(`${category} is central to your values and will shape major decisions in your marriage.`);
  } else if (avgImportance >= 4.0) {
    insights.push(`${category} matters significantly to you.`);
  } else if (avgImportance >= 3.0) {
    insights.push(`${category} carries moderate weight in your priorities.`);
  } else {
    insights.push(`${category} is currently a lower priority for you.`);
  }

  if (avgFlexibility <= 2.0) {
    insights.push('You are very open to adapting here.');
  } else if (avgFlexibility <= 3.5) {
    insights.push('You balance firm preferences with willingness to adapt.');
  } else {
    insights.push('You hold firm convictions here and have little room to compromise.');
  }

  return insights;
};

const getCategoryRecommendations = (category: string, level: string, avgImportance: number): string[] => {
  const recommendations: string[] = [];

  switch (category) {
    case 'Core Values & Ethics':
      if (level === 'excellent') {
        recommendations.push('Name your top three values to your partner and ask for theirs.');
      } else if (level === 'needs_attention') {
        recommendations.push('Reflect on which principles guide your hardest decisions.');
      }
      break;

    case 'Religion':
      if (avgImportance >= 4.0) {
        recommendations.push('Be specific with your partner about which observances you expect to share.');
        recommendations.push('Discuss how faith will shape holidays and the upbringing of any children.');
      } else {
        recommendations.push('Tell your partner plainly how involved in religious life you want to be.');
      }
      break;

    case 'Children & Parenting':
      if (avgImportance >= 4.0) {
        recommendations.push('Agree on whether, when and how many children before the wedding.');
        recommendations.push('Compare how you were each raised and what you would do differently.');
      }
      break;

    case 'Finances':
      if (level === 'needs_attention') {
        recommendations.push('Build a simple personal budget before merging finances.');
      }
      recommendations.push('Share your full financial picture, including debts, with your partner.');
      break;

    case 'Communication & Conflict':
      if (level === 'needs_attention') {
        recommendations.push('Practise naming feelings and taking breaks before conversations escalate.');
        recommendations.push('Consider a premarital communication workshop together.');
      }
      break;

    default:
      if (level === 'excellent') {
        recommendations.push(`Your approach to ${category.toLowerCase()} shows clarity; share your reasoning with your partner.`);
      } else if (level === 'needs_attention') {
        recommendations.push(`Spend some time reflecting on what you want regarding ${category.toLowerCase()}.`);
      }
  }

  return recommendations;
};

const getProfile = (avgImportance: number, avgFlexibility: number): [string, string] => {
  if (avgImportance >= 4.0 && avgFlexibility <= 2.5) {
    return [
      'The Adaptive Achiever',
      'You hold clear priorities but stay open on how to reach them. This combination lets you keep standards while still meeting your partner halfway.',
    ];
  }
  if (avgImportance >= 4.0 && avgFlexibility >= 4.0) {
    return [
      'The Principled Idealist',
      'You have strong convictions and high standards. That clarity is a strength; the growth edge is choosing a few areas where you can deliberately give ground.',
    ];
  }
  if (avgImportance <= 3.0 && avgFlexibility <= 2.5) {
    return [
      'The Easy-Going Supporter',
      'You are adaptable and accommodating. Make sure your own needs are voiced too, so compromise does not always flow from you.',
    ];
  }
  return [
    'The Balanced Partner',
    'You show a healthy mix of clear preferences and flexibility, which tends to make joint decisions smoother.',
  ];
};

const getReadiness = (categoryInsights: QualityOfLifeInsight[]): [string, string] => {
  const needsAttentionCount = categoryInsights.filter((c) => c.level === 'needs_attention').length;
  const excellentCount = categoryInsights.filter((c) => c.level === 'excellent').length;

  if (needsAttentionCount <= 1 && excellentCount >= 8) {
    return [
      'Highly self-aware',
      'You show clarity across almost every life area. You know what you want and where you can bend, which makes the conversations ahead easier.',
    ];
  }
  if (needsAttentionCount <= 3) {
    return [
      'Well prepared',
      'You have good clarity in most areas, with a few worth more reflection before you discuss them with your partner.',
    ];
  }
  if (needsAttentionCount <= 5) {
    return [
      'Still clarifying',
      'You are clear in some areas and still forming views in others. Use the areas below as a personal reflection list.',
    ];
  }
  return [
    'Early in reflection',
    'Many of your priorities are still taking shape. That is normal; talk them through with your partner or a counselor as they form.',
  ];
};

export const generateQualityOfLifeAnalysis = (responses: AssessmentResponse[]): QualityOfLifeReport => {
  const categoryInsights: QualityOfLifeInsight[] = [];
  let totalScore = 0;

  assessmentCategories.forEach((category) => {
    const categoryQuestions = assessmentQuestions.filter((q) => q.category === category);
    const categoryResponses = responses.filter((r) => categoryQuestions.some((q) => q.id === r.questionId));

    if (categoryResponses.length > 0) {
      const avgImportance = categoryResponses.reduce((sum, r) => sum + r.importance, 0) / categoryResponses.length;
      const avgFlexibility = categoryResponses.reduce((sum, r) => sum + r.flexibility, 0) / categoryResponses.length;

      // Rewards having clear priorities held with moderate (not extreme) flexibility.
      const qualityScore =
        avgImportance >= 3.0 ? avgImportance * (1 - Math.abs(avgFlexibility - 2.5) / 2.5) : avgImportance;

      const level = getQualityLevel(qualityScore);
      categoryInsights.push({
        category,
        score: qualityScore,
        level,
        insights: getCategoryInsights(category, avgImportance, avgFlexibility),
        recommendations: getCategoryRecommendations(category, level, avgImportance),
      });

      totalScore += qualityScore;
    }
  });

  const overallScore = categoryInsights.length ? totalScore / categoryInsights.length : 0;

  const strengths = categoryInsights
    .filter((c) => c.level === 'excellent' || c.level === 'good')
    .sort((a, b) => b.score - a.score)
    .map((c) => c.category)
    .slice(0, 5);

  const growthAreas = categoryInsights
    .filter((c) => c.level === 'needs_attention' || c.level === 'moderate')
    .sort((a, b) => a.score - b.score)
    .map((c) => c.category)
    .slice(0, 3);

  const avgImportance = responses.length ? responses.reduce((s, r) => s + r.importance, 0) / responses.length : 0;
  const avgFlexibility = responses.length ? responses.reduce((s, r) => s + r.flexibility, 0) / responses.length : 0;
  const [profileTitle, personalityProfile] = getProfile(avgImportance, avgFlexibility);
  const [readinessTitle, relationshipReadiness] = getReadiness(categoryInsights);

  return {
    overallScore,
    categoryInsights,
    strengths,
    growthAreas,
    profileTitle,
    personalityProfile,
    readinessTitle,
    relationshipReadiness,
    avgImportance,
    avgFlexibility,
  };
};
