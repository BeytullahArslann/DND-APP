
export const STAT_LABELS: {[key: string]: string} = { str: "KUV", dex: "ÇEV", con: "DAY", int: "ZEK", wis: "AKI", cha: "KAR" };
export const STAT_FULL_NAMES = { str: "Kuvvet", dex: "Çeviklik", con: "Dayanıklılık", int: "Zeka", wis: "Akıl", cha: "Karizma" };

export const SKILLS_LIST = [
  { name: "Akrobasi (Acrobatics)", stat: "dex" },
  { name: "Hayvan Terbiyesi (Animal Handling)", stat: "wis" },
  { name: "Arkana (Arcana)", stat: "int" },
  { name: "Atletizm (Athletics)", stat: "str" },
  { name: "Yalan (Deception)", stat: "cha" },
  { name: "Tarih (History)", stat: "int" },
  { name: "Sezgi (Insight)", stat: "wis" },
  { name: "Gözdağı (Intimidation)", stat: "cha" },
  { name: "Araştırma (Investigation)", stat: "int" },
  { name: "Tıp (Medicine)", stat: "wis" },
  { name: "Doğa (Nature)", stat: "int" },
  { name: "Algı (Perception)", stat: "wis" },
  { name: "Performans (Performance)", stat: "cha" },
  { name: "İkna (Persuasion)", stat: "cha" },
  { name: "Din (Religion)", stat: "int" },
  { name: "El Çabukluğu (Sleight of Hand)", stat: "dex" },
  { name: "Gizlilik (Stealth)", stat: "dex" },
  { name: "Hayatta Kalma (Survival)", stat: "wis" }
];

export const BACKGROUNDS_DATA: {[key: string]: {skills: string[]}} = {
  "Asker": { skills: ["Atletizm (Athletics)", "Gözdağı (Intimidation)"] },
  "Bilge": { skills: ["Arkana (Arcana)", "Tarih (History)"] },
  "Eğlencebaz": { skills: ["Akrobasi (Acrobatics)", "Performans (Performance)"] },
  "Halk Kahramanı": { skills: ["Hayvan Terbiyesi (Animal Handling)", "Hayatta Kalma (Survival)"] },
  "Hünkar": { skills: ["Tarih (History)", "İkna (Persuasion)"] },
  "Keşiş": { skills: ["Sezgi (Insight)", "Din (Religion)"] },
  "Köylü": { skills: ["Hayvan Terbiyesi (Animal Handling)", "Doğa (Nature)"] },
  "Soylusu": { skills: ["Tarih (History)", "İkna (Persuasion)"] },
  "Suçlu": { skills: ["Yalan (Deception)", "Gizlilik (Stealth)"] },
  "Şarlatan": { skills: ["Yalan (Deception)", "El Çabukluğu (Sleight of Hand)"] },
  "Tapınak Muhafızı": { skills: ["Sezgi (Insight)", "Din (Religion)"] },
  "Tüccar": { skills: ["Sezgi (Insight)", "İkna (Persuasion)"] },
  "Yabani": { skills: ["Atletizm (Athletics)", "Hayatta Kalma (Survival)"] },
  "Yetim": { skills: ["El Çabukluğu (Sleight of Hand)", "Gizlilik (Stealth)"] }
};

export const RACES: {[key: string]: {bonuses: any, skills: string[]}} = {
  "İnsan": { bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, skills: [] },
  "Yarı Elf": { bonuses: { cha: 2, dex: 1, con: 1 }, skills: [] },
  "Dağ Cücesi": { bonuses: { str: 2, con: 2 }, skills: [] },
  "Tepe Cücesi": { bonuses: { con: 2, wis: 1 }, skills: [] },
  "Ulu Elf": { bonuses: { dex: 2, int: 1 }, skills: ["Algı (Perception)"] },
  "Orman Elfi": { bonuses: { dex: 2, wis: 1 }, skills: ["Algı (Perception)"] },
  "Kara Elf (Drow)": { bonuses: { dex: 2, cha: 1 }, skills: ["Algı (Perception)"] },
  "Hafif Ayak Buçukluk": { bonuses: { dex: 2, cha: 1 }, skills: ["Gizlilik (Stealth)"] },
  "Tıknaz Buçukluk": { bonuses: { dex: 2, con: 1 }, skills: [] },
  "Ejderdoğan": { bonuses: { str: 2, cha: 1 }, skills: [] },
  "Orman Gnomu": { bonuses: { int: 2, dex: 1 }, skills: [] },
  "Kaya Gnomu": { bonuses: { int: 2, con: 1 }, skills: [] },
  "Yarı Ork": { bonuses: { str: 2, con: 1 }, skills: ["Gözdağı (Intimidation)"] },
  "Tiefling": { bonuses: { int: 1, cha: 2 }, skills: [] }
};

export const CLASS_SKILL_OPTIONS: {[key: string]: {choose: number, options: string[]}} = {
  "Barbar": { choose: 2, options: ["Hayvan Terbiyesi (Animal Handling)", "Atletizm (Athletics)", "Gözdağı (Intimidation)", "Doğa (Nature)", "Algı (Perception)", "Hayatta Kalma (Survival)"] },
  "Ozan": { choose: 3, options: SKILLS_LIST.map(s => s.name) },
  "Ruhban": { choose: 2, options: ["Tarih (History)", "Sezgi (Insight)", "Tıp (Medicine)", "İkna (Persuasion)", "Din (Religion)"] },
  "Druid": { choose: 2, options: ["Arkana (Arcana)", "Hayvan Terbiyesi (Animal Handling)", "Sezgi (Insight)", "Tıp (Medicine)", "Doğa (Nature)", "Algı (Perception)", "Din (Religion)", "Hayatta Kalma (Survival)"] },
  "Savaşçı": { choose: 2, options: ["Akrobasi (Acrobatics)", "Hayvan Terbiyesi (Animal Handling)", "Atletizm (Athletics)", "Tarih (History)", "Sezgi (Insight)", "Gözdağı (Intimidation)", "Algı (Perception)", "Hayatta Kalma (Survival)"] },
  "Keşiş": { choose: 2, options: ["Akrobasi (Acrobatics)", "Atletizm (Athletics)", "Tarih (History)", "Sezgi (Insight)", "Din (Religion)", "Gizlilik (Stealth)"] },
  "Paladin": { choose: 2, options: ["Atletizm (Athletics)", "Sezgi (Insight)", "Gözdağı (Intimidation)", "Tıp (Medicine)", "İkna (Persuasion)", "Din (Religion)"] },
  "Koruyucu": { choose: 3, options: ["Hayvan Terbiyesi (Animal Handling)", "Atletizm (Athletics)", "Sezgi (Insight)", "Araştırma (Investigation)", "Doğa (Nature)", "Algı (Perception)", "Gizlilik (Stealth)", "Hayatta Kalma (Survival)"] },
  "Hırsız": { choose: 4, options: ["Akrobasi (Acrobatics)", "Atletizm (Athletics)", "Yalan (Deception)", "Sezgi (Insight)", "Gözdağı (Intimidation)", "Araştırma (Investigation)", "Algı (Perception)", "Performans (Performance)", "İkna (Persuasion)", "El Çabukluğu (Sleight of Hand)", "Gizlilik (Stealth)"] },
  "Sihirbaz (Sorcerer)": { choose: 2, options: ["Arkana (Arcana)", "Yalan (Deception)", "Sezgi (Insight)", "Gözdağı (Intimidation)", "İkna (Persuasion)", "Din (Religion)"] },
  "Warlock": { choose: 2, options: ["Arkana (Arcana)", "Yalan (Deception)", "Tarih (History)", "Gözdağı (Intimidation)", "Araştırma (Investigation)", "Doğa (Nature)", "Din (Religion)"] },
  "Büyücü (Wizard)": { choose: 2, options: ["Arkana (Arcana)", "Tarih (History)", "Sezgi (Insight)", "Araştırma (Investigation)", "Tıp (Medicine)", "Din (Religion)"] }
};

export const CLASSES: {[key: string]: {hitDie: number, primary: string, subclassLevel: number, casterType: string}} = {
  "Barbar": { hitDie: 12, primary: "str", subclassLevel: 3, casterType: "none" },
  "Ozan": { hitDie: 8, primary: "cha", subclassLevel: 3, casterType: "full" },
  "Ruhban": { hitDie: 8, primary: "wis", subclassLevel: 1, casterType: "full" },
  "Druid": { hitDie: 8, primary: "wis", subclassLevel: 2, casterType: "full" },
  "Savaşçı": { hitDie: 10, primary: "str", subclassLevel: 3, casterType: "third" },
  "Keşiş": { hitDie: 8, primary: "dex", subclassLevel: 3, casterType: "none" },
  "Paladin": { hitDie: 10, primary: "str", subclassLevel: 3, casterType: "half" },
  "Koruyucu": { hitDie: 10, primary: "dex", subclassLevel: 3, casterType: "half" },
  "Hırsız": { hitDie: 8, primary: "dex", subclassLevel: 3, casterType: "third" },
  "Sihirbaz (Sorcerer)": { hitDie: 6, primary: "cha", subclassLevel: 1, casterType: "full" },
  "Warlock": { hitDie: 8, primary: "cha", subclassLevel: 1, casterType: "full" },
  "Büyücü (Wizard)": { hitDie: 6, primary: "int", subclassLevel: 2, casterType: "full" }
};

export const SUBCLASSES = {
  "Barbar": ["Berserker", "Totem Savaşçısı", "Atalar Koruyucusu", "Fırtına Habercisi"],
  "Ozan": ["Cesaret Koleji", "Bilgi Koleji", "Kılıç Koleji", "Fısıltı Koleji"],
  "Ruhban": ["Yaşam Alanı", "Işık Alanı", "Savaş Alanı", "Hile Alanı", "Fırtına Alanı", "Bilgi Alanı"],
  "Druid": ["Ay Çemberi", "Toprak Çemberi", "Rüya Çemberi", "Çoban Çemberi"],
  "Savaşçı": ["Şampiyon", "Savaş Ustası", "Eldritch Şövalyesi", "Samuray", "Arcane Okçu"],
  "Keşiş": ["Açık El Yolu", "Gölge Yolu", "Dört Element Yolu", "Sarhoş Usta"],
  "Paladin": ["Sadakat Yemini", "Kadim Yemin", "İntikam Yemini", "Fetih Yemini"],
  "Koruyucu": ["Avcı", "Canavar Terbiyecisi", "Ufuk Gezgini", "Canavar Katili"],
  "Hırsız": ["Hırsız", "Suikastçi", "Arcane Trickster", "İnquisitive", "Swashbuckler"],
  "Sihirbaz (Sorcerer)": ["Ejderha Soyu", "Vahşi Büyü", "Gölge Büyüsü", "İlahi Ruh"],
  "Warlock": ["Archfey", "Fiend", "Great Old One", "Celestial", "Hexblade"],
  "Büyücü (Wizard)": ["Abjuration", "Evocation", "Necromancy", "Divination", "Illusion", "Transmutation"]
};

export const SPELL_SLOT_TABLE = [
  [0,0,0,0,0,0,0,0,0], [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0], [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0], [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,0], [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1],
  [4,3,3,3,3,2,2,1,1]
];

// Büyü Veritabanı - Tipler Eklendi
// type: 'attack' (Saldırı zarı ve hasar), 'damage' (Sadece hasar/AoE), 'heal' (İyileştirme), 'utility' (Sadece slot harcar)
export const SPELL_DB = [
  { name: "Büyülü Füze (Magic Missile)", level: 1, type: 'damage', dmg: '3d4+3' },
  { name: "Kalkan (Shield)", level: 1, type: 'utility' },
  { name: "Büyücü Zırhı (Mage Armor)", level: 1, type: 'utility' },
  { name: "Yaraları İyileştir (Cure Wounds)", level: 1, type: 'heal', dmg: '1d8' },
  { name: "Şifa Sözü (Healing Word)", level: 1, type: 'heal', dmg: '1d4' },
  { name: "Büyü Sezme (Detect Magic)", level: 1, type: 'utility' },
  { name: "Gök Gürültüsü Dalgası (Thunderwave)", level: 1, type: 'damage', dmg: '2d8' },
  { name: "Uyku (Sleep)", level: 1, type: 'damage', dmg: '5d8' }, // Etki zarı olarak
  { name: "Yanan Eller (Burning Hands)", level: 1, type: 'damage', dmg: '3d6' },
  { name: "Görünmezlik (Invisibility)", level: 2, type: 'utility' },
  { name: "Puslu Adım (Misty Step)", level: 2, type: 'utility' },
  { name: "Paramparça (Shatter)", level: 2, type: 'damage', dmg: '3d8' },
  { name: "Kişiyi Tutma (Hold Person)", level: 2, type: 'utility' },
  { name: "Düşük Restorasyon (Lesser Restoration)", level: 2, type: 'utility' },
  { name: "Ruhani Silah (Spiritual Weapon)", level: 2, type: 'attack', dmg: '1d8' }, // Bonus action attack
  { name: "Ateş Topu (Fireball)", level: 3, type: 'damage', dmg: '8d6' },
  { name: "Büyü Bozma (Counterspell)", level: 3, type: 'utility' },
  { name: "Uçma (Fly)", level: 3, type: 'utility' },
  { name: "Sürat (Haste)", level: 3, type: 'utility' },
  { name: "Canlandırma (Revivify)", level: 3, type: 'utility' },
  { name: "Yıldırım Oku (Lightning Bolt)", level: 3, type: 'damage', dmg: '8d6' },
  { name: "Polimorf (Polymorph)", level: 4, type: 'utility' },
  { name: "Boyut Kapısı (Dimension Door)", level: 4, type: 'utility' },
  { name: "Yüce Görünmezlik (Greater Invisibility)", level: 4, type: 'utility' },
  { name: "Soğuk Konisi (Cone of Cold)", level: 5, type: 'damage', dmg: '8d8' },
  { name: "Yüce Restorasyon (Greater Restoration)", level: 5, type: 'utility' }
];

export const STAT_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
