import { RuleEntry } from './rules';

export type Language = 'tr' | 'en';

export interface CMSDocument {
  id?: string;
  language: Language;
  createdAt?: any;
  updatedAt?: any;
}

export interface RuleDocument extends CMSDocument {
  title: string; // Section name (e.g., "Savaş", "Combat")
  content: RuleEntry[]; // The recursive JSON structure
  order: number; // To sort sections
}

export interface SpellDocument extends CMSDocument {
  name: string;
  level: number;
  school: string;
  time: string; // Simplified string for UI, or keep complex object
  range: string;
  components: string;
  duration: string;
  description: string; // Flattened entries for simpler editing if possible, or keep complex
  classes: string[];
}

export interface WeaponDocument extends CMSDocument {
  name: string;
  category: string; // Simple Melee, Martial Ranged etc.
  damage: string; // e.g., "1d8"
  damageType: string; // e.g., "slashing"
  properties: string[]; // e.g., ["Light", "Finesse"]
  weight?: string;
  cost?: string;
  range?: string; // "20/60"
}

export interface BackgroundDocument extends CMSDocument {
  name: string;
  description: string; // HTML or text
  skillProficiencies: string;
  toolProficiencies: string;
  languages: string;
  equipment: string; // HTML or text
  featureName: string;
  featureDescription: string; // HTML or text
  suggestedCharacteristics: string; // HTML (tables)
}
