
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
  category: string;
  damage: string;
  damageType: string;
  properties: string[];
  weight?: string;
  cost?: string;
  range?: string;

  translations?: {
    tr?: {
      name: string;
      category?: string;
      damageType?: string;
      properties?: string[];
    }
  };
}

export interface BackgroundDocument extends CMSDocument {
  name: string; // EN
  description: string; // EN
  skillProficiencies: string; // EN
  toolProficiencies: string; // EN
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
// Export Language type for backward compatibility helper if needed,
// though we are removing the language field from the document itself.
export type Language = 'tr' | 'en';
