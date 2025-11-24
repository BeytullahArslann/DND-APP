
export interface LocalizedContent<T> {
  en: T;
  tr?: T;
}

export interface CMSDocument {
  id?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RuleDocument extends CMSDocument {
  title: string; // EN Title (mandatory)
  content: any; // EN Content (mandatory), string or structure
  translations?: {
    tr?: {
        title: string;
        content: any;
    }
  };
  order: number;
}

export interface SpellDocument extends CMSDocument {
  name: string; // EN
  level: number;
  school: string;
  time: string; // EN
  range: string; // EN
  components: string; // EN
  duration: string; // EN
  description: string; // EN
  classes: string[];

  translations?: {
    tr?: {
      name: string;
      time?: string;
      range?: string;
      components?: string;
      duration?: string;
      description?: string;
    }
  };
}

export interface WeaponDocument extends CMSDocument {
  name: string; // EN
  category: string; // EN (Simple, Martial)
  damage: string; // e.g., "1d8"
  damageType: string; // EN (slashing, etc)
  properties: string[]; // EN (Light, Finesse)

  // Categorical Data
  diceCount?: number;
  diceValue?: string; // d4, d6, d8, d10, d12, 2d6 etc (stored as string "d8")
  damageBonus?: number;

  weight?: string;
  cost?: string;
  range?: string;
  description?: string; // EN (HTML) - Added for Magic Weapons info

  translations?: {
    tr?: {
      name: string;
      category?: string;
      damageType?: string;
      properties?: string[];
      description?: string;
    }
  };
}

export interface ArmorDocument extends CMSDocument {
  name: string; // EN
  type: 'Light' | 'Medium' | 'Heavy' | 'Shield';
  ac: number;
  dexBonus: 'None' | 'Full' | 'Max 2'; // Mechanic
  stealthDisadvantage: boolean;
  strengthRequirement: number;
  weight?: string;
  cost?: string;
  description?: string;

  translations?: {
    tr?: {
      name: string;
      type?: string;
      description?: string;
    }
  };
}

export interface BackgroundDocument extends CMSDocument {
  name: string; // EN
  description: string; // EN

  // Legacy / Display fields
  skillProficiencies: string; // Text description
  toolProficiencies: string; // Text description

  // Structured Data
  bonuses?: {
      skills?: string[]; // Array of skill keys (e.g., ['athletics', 'history'])
  };

  languages: string; // EN
  equipment: string; // EN
  featureName: string; // EN
  featureDescription: string; // EN
  suggestedCharacteristics: string; // EN

  translations?: {
    tr?: {
      name: string;
      description?: string;
      skillProficiencies?: string;
      toolProficiencies?: string;
      languages?: string;
      equipment?: string;
      featureName?: string;
      featureDescription?: string;
      suggestedCharacteristics?: string;
    }
  };
}

export type Language = 'tr' | 'en';
