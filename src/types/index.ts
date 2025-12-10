
export interface RollLog {
  id?: string;
  playerName: string;
  uid: string;
  sides?: number;
  result: number | string;
  total?: number;
  diceResults?: { sides: number; result: number }[];
  timestamp?: any; // Firestore Timestamp
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
  armor?: {
    id: string;
    name: string;
    ac: number;
    type: string;
    dexBonus: string; // 'Full', 'Max 2', 'None'
    stealthDisadvantage: boolean;
  } | null;
  shield?: {
    id: string;
    name: string;
    ac: number;
  } | null;
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

// --- New Core Types ---

export type UserRole = 'dm' | 'player' | 'spectator';

export interface RoomInvite {
  roomId: string;
  roomName: string;
  inviterName: string;
  timestamp: number; // Epoch
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: any; // Firestore Timestamp
  lastLogin?: any; // Firestore Timestamp
  friends: string[]; // List of UIDs
  rooms: string[]; // List of Room IDs
  roomInvites?: RoomInvite[];
  isAdmin?: boolean;
  bio?: string;
  isBanned?: boolean;
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // Array of UIDs
  roles: { [uid: string]: UserRole };
  pendingRequests?: string[]; // Array of UIDs
  createdAt?: any;
  // Add other room specific fields here if needed
}

export interface NPC {
  id: string;
  name: string;
  description: string; // Karakter Tarifi
  age: string;
  height: string;
  weight: string;
  appearance: string; // Görünüm Seçenekleri
  imageUrl?: string;
  isPrivate: boolean; // Hidden from players
  roomId: string;
  createdBy: string; // DM uid
}

export interface NPCNote {
  id: string;
  npcId: string;
  authorId: string;
  content: string;
  isPublic: boolean; // If true, visible to everyone in room. If false, visible only to author.
  timestamp: number;
}
