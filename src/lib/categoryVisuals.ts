import {
  BookOpen,
  Baby,
  Briefcase,
  Compass,
  CookingPot,
  Heart,
  HeartPulse,
  House,
  LucideIcon,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Wallet,
} from 'lucide-react';

export interface CategoryVisual {
  icon: LucideIcon;
  hue: number;
}

export const categoryVisuals: Record<string, CategoryVisual> = {
  'Core Values & Ethics': { icon: Compass, hue: 222 },
  Religion: { icon: BookOpen, hue: 30 },
  Spirituality: { icon: Sparkles, hue: 272 },
  'Relationship Model & Boundaries': { icon: ShieldCheck, hue: 188 },
  'Life Vision & Home': { icon: House, hue: 150 },
  'Children & Parenting': { icon: Baby, hue: 330 },
  Finances: { icon: Wallet, hue: 128 },
  'Work & Career': { icon: Briefcase, hue: 204 },
  'Household & Roles': { icon: CookingPot, hue: 18 },
  'Communication & Conflict': { icon: MessagesSquare, hue: 248 },
  'Love, Intimacy & Sex': { icon: Heart, hue: 352 },
  'Health & Lifestyle': { icon: HeartPulse, hue: 168 },
  'Family of Origin & In-Laws': { icon: Users, hue: 44 },
  'Growth & Change': { icon: Sprout, hue: 96 },
};

export const getCategoryVisual = (category: string): CategoryVisual =>
  categoryVisuals[category] ?? { icon: Compass, hue: 222 };
