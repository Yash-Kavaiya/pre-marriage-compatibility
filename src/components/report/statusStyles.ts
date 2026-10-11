import { Anchor, CircleCheck, Flame, LucideIcon, MessageCircleMore } from 'lucide-react';
import type { Status } from '@/lib/compatibility';

export const shortCategory: Record<string, string> = {
  'Core Values & Ethics': 'Values',
  Religion: 'Religion',
  Spirituality: 'Spirituality',
  'Relationship Model & Boundaries': 'Boundaries',
  'Life Vision & Home': 'Life vision',
  'Children & Parenting': 'Children',
  Finances: 'Finances',
  'Work & Career': 'Career',
  'Household & Roles': 'Household',
  'Communication & Conflict': 'Communication',
  'Love, Intimacy & Sex': 'Intimacy',
  'Health & Lifestyle': 'Health',
  'Family of Origin & In-Laws': 'In-laws',
  'Growth & Change': 'Growth',
};

export const statusClasses: Record<Status, { soft: string; text: string; solid: string; border: string }> = {
  aligned: { soft: 'bg-aligned-soft', text: 'text-aligned', solid: 'bg-aligned', border: 'border-aligned/30' },
  discuss: { soft: 'bg-discuss-soft', text: 'text-discuss', solid: 'bg-discuss', border: 'border-discuss/30' },
  priority: { soft: 'bg-priority-soft', text: 'text-priority', solid: 'bg-priority', border: 'border-priority/30' },
  confirm: { soft: 'bg-confirm-soft', text: 'text-confirm', solid: 'bg-confirm', border: 'border-confirm/30' },
};

export const statusIcons: Record<Status, LucideIcon> = {
  aligned: CircleCheck,
  discuss: MessageCircleMore,
  priority: Flame,
  confirm: Anchor,
};
