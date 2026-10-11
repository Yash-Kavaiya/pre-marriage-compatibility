import { assessmentQuestions } from '@/data/assessmentQuestions';
import type { AssessmentResponse, PartnerData } from '@/lib/types';

const VERSION = '1';
const ANSWER_ALPHABET = '-ABCDEFGHIJKLMNOPQRSTUVWXY';
const SEPARATOR = '.';

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code: string) => {
  const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const packAnswers = (responses: AssessmentResponse[]) => {
  const byId = new Map(responses.map((r) => [r.questionId, r]));
  return assessmentQuestions
    .map((q) => {
      const r = byId.get(q.id);
      if (!r || !r.importance || !r.flexibility) return ANSWER_ALPHABET[0];
      return ANSWER_ALPHABET[(r.importance - 1) * 5 + r.flexibility];
    })
    .join('');
};

const unpackAnswers = (packed: string): AssessmentResponse[] => {
  if (packed.length !== assessmentQuestions.length) throw new Error('Answer length mismatch');
  const responses: AssessmentResponse[] = [];
  assessmentQuestions.forEach((q, i) => {
    const index = ANSWER_ALPHABET.indexOf(packed[i]);
    if (index < 0) throw new Error('Invalid answer character');
    if (index === 0) return;
    responses.push({
      questionId: q.id,
      importance: Math.floor((index - 1) / 5) + 1,
      flexibility: ((index - 1) % 5) + 1,
    });
  });
  return responses;
};

export const encodePartner = (partner: PartnerData) =>
  toBase64Url(
    [VERSION, encodeURIComponent(partner.name), packAnswers(partner.responses), partner.completedAt.getTime().toString(36)].join(
      SEPARATOR,
    ),
  );

export const decodePartner = (code: string): PartnerData | null => {
  try {
    const [version, name, packed, timestamp] = fromBase64Url(code.trim()).split(SEPARATOR);
    if (version !== VERSION || !name) return null;
    const responses = unpackAnswers(packed);
    if (!responses.length) return null;
    return {
      name: decodeURIComponent(name),
      responses,
      completedAt: new Date(parseInt(timestamp, 36) || Date.now()),
    };
  } catch {
    return null;
  }
};

const baseUrl = () => `${window.location.origin}${window.location.pathname}`;

export const inviteHash = (partner: PartnerData) => `#invite=${encodePartner(partner)}`;

export const reportHash = (a: PartnerData, b: PartnerData) => `#report=${encodePartner(a)}~${encodePartner(b)}`;

export const buildInviteUrl = (partner: PartnerData) => `${baseUrl()}${inviteHash(partner)}`;

export const buildReportUrl = (a: PartnerData, b: PartnerData) => `${baseUrl()}${reportHash(a, b)}`;

export type SharedPayload =
  | { kind: 'invite'; partner: PartnerData }
  | { kind: 'report'; partnerA: PartnerData; partnerB: PartnerData };

const parseHashLike = (input: string): SharedPayload | null => {
  const inviteMatch = input.match(/invite=([A-Za-z0-9_-]+)/);
  if (inviteMatch) {
    const partner = decodePartner(inviteMatch[1]);
    return partner ? { kind: 'invite', partner } : null;
  }
  const reportMatch = input.match(/report=([A-Za-z0-9_-]+)~([A-Za-z0-9_-]+)/);
  if (reportMatch) {
    const partnerA = decodePartner(reportMatch[1]);
    const partnerB = decodePartner(reportMatch[2]);
    return partnerA && partnerB ? { kind: 'report', partnerA, partnerB } : null;
  }
  return null;
};

export const readSharedPayloadFromHash = () => parseHashLike(window.location.hash);

/** Accepts a full invite/report link or a bare invite code pasted by the user. */
export const parseSharedInput = (input: string): SharedPayload | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const fromLink = parseHashLike(trimmed);
  if (fromLink) return fromLink;
  const partner = decodePartner(trimmed);
  return partner ? { kind: 'invite', partner } : null;
};

export const setHash = (hash: string) => {
  window.history.replaceState(null, '', hash ? `${baseUrl()}${hash}` : baseUrl());
};
