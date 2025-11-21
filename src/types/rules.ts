export interface RuleEntry {
  type?: string;
  name?: string;
  entries?: (string | RuleEntry)[];
  caption?: string; // for tables
  colLabels?: string[]; // for tables
  colStyles?: string[]; // for tables
  rows?: (string | RuleEntry | (string | RuleEntry)[])[]; // for tables
  items?: (string | RuleEntry)[]; // for lists
  style?: string; // for lists or rows
  href?: { type: string; path: string }; // for images
  text?: string; // for links
}

export interface RuleSection {
  name: string;
  id: string;
  contents: { name: string; headers: string[] }[];
}

export interface QuickReferenceData {
  reference: RuleSection[];
  data: RuleEntry[];
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  time: [{ number: number; unit: string; condition?: string }];
  range: { type: string; distance: { type: string; amount?: number } };
  components: { v?: boolean; s?: boolean; m?: string | { text: string; cost?: number } };
  duration: [{ type: string; duration?: { type: string; amount: number }; concentration?: boolean }];
  entries: (string | RuleEntry)[];
  entriesHigherLevel?: (string | RuleEntry)[];
  source: string;
  page: number;
  classes?: { fromClassList: { name: string; source: string }[] };
}

export interface SpellsData {
  spell: Spell[];
}
