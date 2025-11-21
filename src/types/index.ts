
export interface RollLog {
  id?: string;
  playerName: string;
  uid: string;
  sides?: number;
  result: number | string;
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
