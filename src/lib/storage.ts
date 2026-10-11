import type { AssessmentResponse, PartnerData } from '@/lib/types';
import { decodePartner, encodePartner } from '@/lib/shareLink';

const DRAFT_KEY = 'pmc.draft.v1';
const SELF_KEY = 'pmc.self.v1';
const REPORT_KEY = 'pmc.report.v1';

export interface Draft {
  name: string;
  responses: AssessmentResponse[];
  questionIndex: number;
  inviteCode?: string;
}

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota); autosave is best-effort.
  }
};

export const loadDraft = () => read<Draft>(DRAFT_KEY);
export const saveDraft = (draft: Draft) => write(DRAFT_KEY, draft);
export const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

export const loadSelf = (): PartnerData | null => {
  const code = read<string>(SELF_KEY);
  return code ? decodePartner(code) : null;
};
export const saveSelf = (partner: PartnerData) => write(SELF_KEY, encodePartner(partner));
export const clearSelf = () => localStorage.removeItem(SELF_KEY);

export const loadReport = (): { partnerA: PartnerData; partnerB: PartnerData } | null => {
  const codes = read<[string, string]>(REPORT_KEY);
  if (!codes) return null;
  const partnerA = decodePartner(codes[0]);
  const partnerB = decodePartner(codes[1]);
  return partnerA && partnerB ? { partnerA, partnerB } : null;
};
export const saveReport = (a: PartnerData, b: PartnerData) => write(REPORT_KEY, [encodePartner(a), encodePartner(b)]);

export const clearAll = () => {
  clearDraft();
  clearSelf();
  localStorage.removeItem(REPORT_KEY);
};
