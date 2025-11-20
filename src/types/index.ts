
export interface RollLog {
  id?: string;
  playerName: string;
  uid: string;
  sides?: number;
  result: number | string;
  timestamp?: any;
  type: 'dice' | 'attack' | 'spell';
  spellName?: string;
  spellType?: string;
  level?: number;
  hitBonus?: number;
  damage?: number;
  damageType?: string;
  isCrit?: boolean;
  weapon?: string;
}

export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ClassData {
  name: string;
  level: number;
  subclass: string;
}

export interface Weapon {
  id: number;
  name: string;
  hit: number;
  dmg: string;
  type?: string;
}

export interface Spell {
  id?: number;
  name: string;
  level: number;
  type: string;
  dmg?: string;
}

export interface CharacterData {
  name: string;
  race: string;
  background: string;
  classes: ClassData[];
  hp: number;
  maxHp: number;
  hitDiceCurrent: number;
  stats: Stats;
  inventory: any[];
  spells: Spell[];
  spellSlots: {[key: number]: number};
  skills: string[];
  weapons: Weapon[];
}

export interface PlayerPresence {
  uid: string;
  name: string;
  class: string;
  race: string;
  level: number;
  hp: number;
  maxHp: number;
  lastActive: any;
}
