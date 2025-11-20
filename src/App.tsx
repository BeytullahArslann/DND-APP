import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit,
  getDoc
} from 'firebase/firestore';
import { 
  Sword, 
  Shield, 
  Scroll, 
  Users, 
  Dices, 
  Heart, 
  Backpack, 
  Plus, 
  Trash2, 
  History as HistoryIcon,
  Flame,
  ChevronUp,
  Skull,
  BookOpen,
  Moon,
  Sun,
  X,
  User,
  Feather,
  Link2,
  CheckSquare,
  Lock,
  Eye,
  Crown,
  Edit3,
  Target,
  Zap
} from 'lucide-react';

// --- Firebase Kurulumu ---
const firebaseConfigString =
  import.meta.env.VITE_FIREBASE_CONFIG ||
  JSON.stringify({
    apiKey: 'demo',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo',
    storageBucket: 'demo.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:demo:web:demo'
  });

const firebaseConfig = JSON.parse(firebaseConfigString);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID ?? 'default-app-id';
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN;
const usingDemoConfig = !import.meta.env.VITE_FIREBASE_CONFIG;

// --- 5eTürkçe (Kanguen) Kural Setleri ---

const STAT_LABELS = { str: "KUV", dex: "ÇEV", con: "DAY", int: "ZEK", wis: "AKI", cha: "KAR" };
const STAT_FULL_NAMES = { str: "Kuvvet", dex: "Çeviklik", con: "Dayanıklılık", int: "Zeka", wis: "Akıl", cha: "Karizma" };

const SKILLS_LIST = [
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

const BACKGROUNDS_DATA = {
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

const RACES = {
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

const CLASS_SKILL_OPTIONS = {
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

const CLASSES = {
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

const SUBCLASSES = {
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

const SPELL_SLOT_TABLE = [
  [0,0,0,0,0,0,0,0,0], [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0], 
  [4,3,0,0,0,0,0,0,0], [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0], 
  [4,3,3,2,0,0,0,0,0], [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,1,0,0,0], 
  [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,1,0], 
  [4,3,3,3,2,1,1,1,0], [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1], 
  [4,3,3,3,3,2,2,1,1]
];

// Büyü Veritabanı - Tipler Eklendi
// type: 'attack' (Saldırı zarı ve hasar), 'damage' (Sadece hasar/AoE), 'heal' (İyileştirme), 'utility' (Sadece slot harcar)
const SPELL_DB = [
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

const STAT_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// --- Yardımcı Fonksiyonlar ---
const getModifier = (score) => Math.floor((score - 10) / 2);
const formatModifier = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);
const getProficiencyBonus = (level) => Math.ceil(level / 4) + 1;

const calculateCasterLevel = (classes) => {
  let total = 0;
  classes.forEach(c => {
    if (['Ozan','Ruhban','Druid','Sihirbaz (Sorcerer)','Büyücü (Wizard)'].includes(c.name)) total += c.level;
    else if (['Paladin','Koruyucu'].includes(c.name)) total += Math.floor(c.level / 2);
    else if (['Savaşçı','Hırsız'].includes(c.name)) total += Math.floor(c.level / 3);
  });
  return Math.max(0, total);
};

const parseDamage = (damageStr) => {
  if(!damageStr) return { diceCount: 0, diceSides: 0, bonus: 0 };
  const regex = /(\d+)d(\d+)([+-]\d+)?/;
  const match = damageStr.match(regex);
  if (!match) return { diceCount: 0, diceSides: 0, bonus: 0 };
  return {
    diceCount: parseInt(match[1]),
    diceSides: parseInt(match[2]),
    bonus: match[3] ? parseInt(match[3]) : 0
  };
};

// --- Bileşenler ---

const Lobby = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('room') || '';
  });
  const [role, setRole] = useState('player');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && room) onJoin(name, room, role);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-6">
          <Dices className="w-16 h-16 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-center text-amber-500 mb-2">Zindan Ustası</h1>
        <p className="text-slate-400 text-center mb-8">Rolünü seç ve maceraya katıl.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Kullanıcı Adı</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Örn: Caner"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Oda Kodu</label>
            <input 
              type="text" 
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Örn: masa1"
              required
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                  <option value="player">Oyuncu (Karakter Yönetimi)</option>
                  <option value="dm">DM (Yönetici)</option>
                  <option value="spectator">İzleyici (Sadece İzle)</option>
              </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg mt-4"
          >
            Maceraya Katıl
          </button>
        </form>
      </div>
    </div>
  );
};

const DiceRoller = ({ user, roomCode }) => {
  const [history, setHistory] = useState([]);
  const [latestRoll, setLatestRoll] = useState(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!roomCode) return;
    
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(rolls);
      if (rolls.length > 0) {
        const newest = rolls[0];
        if (!latestRoll || (newest.timestamp && latestRoll.timestamp && newest.timestamp.seconds !== latestRoll.timestamp.seconds)) {
          setLatestRoll(newest);
        } else if (!latestRoll) {
           setLatestRoll(newest);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  useEffect(() => {
    if (latestRoll) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [latestRoll]);

  const rollDice = async (sides) => {
    if (!user) return;
    const result = Math.floor(Math.random() * sides) + 1;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`), {
      playerName: user.displayName,
      uid: user.uid,
      sides: sides,
      result: result,
      timestamp: serverTimestamp(),
      type: 'dice'
    });
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      <div className="flex-1 bg-slate-800 rounded-xl border-2 border-slate-700 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {latestRoll ? (
          <div className={`transform transition-all duration-700 ${animating ? 'scale-125 rotate-180 opacity-50' : 'scale-100 rotate-0 opacity-100'}`}>
            <div className={`
              w-32 h-32 flex items-center justify-center 
              bg-gradient-to-br from-amber-500 to-amber-700 
              rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)]
              border-4 border-amber-300
              text-6xl font-black text-white text-shadow
            `}>
              {latestRoll.type === 'spell' && latestRoll.damage ? latestRoll.damage : latestRoll.result}
            </div>
            <div className="text-center mt-4 text-amber-400 font-bold">
              {latestRoll.playerName}
              {latestRoll.type === 'attack' ? ` - Saldırı` : latestRoll.type === 'spell' ? ` - ${latestRoll.spellName}` : ` (d${latestRoll.sides})`}
            </div>
            {latestRoll.type === 'attack' && (
                <div className="text-center text-sm text-slate-300 mt-2 bg-slate-900/50 p-2 rounded">
                    {latestRoll.isCrit && <span className="text-red-500 font-bold animate-pulse">KRİTİK VURUŞ! </span>}
                    <span className="block">Hasar: {latestRoll.damage} ({latestRoll.damageType})</span>
                </div>
            )}
            {latestRoll.type === 'spell' && latestRoll.result === 'Büyü Yapıldı' && (
                <div className="text-center text-sm text-slate-300 mt-2">
                    {latestRoll.spellType === 'utility' ? 'İşlevsel Büyü' : 'Etki/Hasar uygulandı'}
                </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">Zar bekleniyor...</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[4, 6, 8, 10, 12, 20].map(sides => (
          <button
            key={sides}
            onClick={() => rollDice(sides)}
            className="bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 text-white p-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2"
          >
            <span>d{sides}</span>
          </button>
        ))}
      </div>

      <div className="h-48 bg-slate-900 rounded-lg p-2 overflow-y-auto border border-slate-700">
        <div className="flex items-center text-xs text-slate-400 mb-2 px-1">
          <HistoryIcon className="w-3 h-3 mr-1" /> Son Atışlar
        </div>
        <div className="space-y-2">
          {history.map((roll) => (
            <div key={roll.id} className="flex flex-col bg-slate-800 p-2 rounded text-sm border border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-medium">{roll.playerName}</span>
                <span className="text-slate-500 text-xs">
                    {roll.type === 'attack' ? 'Saldırı' : roll.type === 'spell' ? 'Büyü' : `d${roll.sides}`}
                </span>
              </div>
              {roll.type === 'attack' ? (
                  <div className="mt-1 text-xs grid grid-cols-2 gap-2">
                      <div className="bg-slate-900 p-1 rounded text-center">
                          <div className="text-slate-500">Tutturma</div>
                          <div className={`font-bold ${roll.result === 20 ? 'text-green-400' : roll.result === 1 ? 'text-red-400' : 'text-white'}`}>
                              {roll.result} {roll.hitBonus >= 0 ? `+${roll.hitBonus}` : roll.hitBonus} = <span className="text-amber-400">{roll.result + parseInt(roll.hitBonus || 0)}</span>
                          </div>
                      </div>
                      <div className="bg-slate-900 p-1 rounded text-center">
                          <div className="text-slate-500">Hasar</div>
                          <div className="font-bold text-red-400">{roll.damage}</div>
                      </div>
                  </div>
              ) : roll.type === 'spell' ? (
                  <div className="mt-1 text-xs">
                      <span className="text-purple-300 font-bold">{roll.spellName}</span>
                      {roll.damage && <span className="ml-2 text-red-300">Hasar: {roll.damage}</span>}
                  </div>
              ) : (
                  <div className="text-right font-bold text-amber-400">{roll.result}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CharacterSheet = ({ user, roomCode, targetUid, isDM }) => {
  const [charData, setCharData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [showRestModal, setShowRestModal] = useState(false);
  const [restType, setRestType] = useState(null);
  
  // Level Up UI
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpPhase, setLevelUpPhase] = useState('select'); 
  const [levelUpSelection, setLevelUpSelection] = useState({ type: 'existing', classIndex: 0, newClassName: '' });
  const [levelUpRoll, setLevelUpRoll] = useState(null);
  
  // Attack Result Popup
  const [attackResult, setAttackResult] = useState(null);

  // Item & Spell Input
  const [selectedSpellObj, setSelectedSpellObj] = useState(null);
  const [newWeapon, setNewWeapon] = useState({ name: '', hit: 0, dmg: '1d6', type: 'slashing' });

  const canEdit = isDM || (user.uid === targetUid);
  
  const [setupData, setSetupData] = useState({ name: '', race: 'İnsan', class: 'Savaşçı', background: 'Asker' });

  useEffect(() => {
    if (!targetUid || !roomCode) return;
    
    const docRef = doc(db, 'artifacts', appId, 'users', targetUid, 'characters', `room_${roomCode}`);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.classes) data.classes = [];
        if (!data.race) data.race = 'İnsan';
        if (!data.background) data.background = 'Asker';
        if (!data.skills) data.skills = [];
        if (!data.weapons) data.weapons = [];
        setCharData(data);
      } else {
        if(isDM) {
            setCharData(null); 
        } else {
            setCharData(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetUid, roomCode, isDM]);

  const handleSetupSubmit = async () => {
      const newData = {
          name: setupData.name,
          race: setupData.race,
          background: setupData.background,
          classes: [{ name: setupData.class, level: 1, subclass: '' }],
          hp: 12, maxHp: 12, hitDiceCurrent: 1,
          stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }, 
          inventory: [], spells: [], spellSlots: {}, skills: [], weapons: []
      };
      
      const docRef = doc(db, 'artifacts', appId, 'users', targetUid, 'characters', `room_${roomCode}`);
      await setDoc(docRef, newData);
      
      const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'presence', roomCode);
      await setDoc(publicRef, {
          players: {
              [targetUid]: {
                  uid: targetUid,
                  name: newData.name,
                  class: newData.classes[0].name,
                  race: newData.race,
                  level: 1,
                  hp: 12, maxHp: 12,
                  lastActive: serverTimestamp()
              }
          }
      }, { merge: true });
  };

  const updateChar = async (newData) => {
    if (!canEdit) return;
    setCharData(newData); 
    
    const docRef = doc(db, 'artifacts', appId, 'users', targetUid, 'characters', `room_${roomCode}`);
    await setDoc(docRef, newData, { merge: true });
    
    if (newData.classes || newData.hp || newData.maxHp || newData.name) {
        const totalLevel = (newData.classes || []).reduce((acc, c) => acc + c.level, 0);
        const mainClass = (newData.classes || [])[0]?.name || 'Sınıfsız';
        
        const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'presence', roomCode);
        await setDoc(publicRef, {
            players: {
                [targetUid]: {
                    uid: targetUid,
                    name: newData.name,
                    class: mainClass,
                    race: newData.race,
                    level: totalLevel,
                    hp: newData.hp,
                    maxHp: newData.maxHp,
                    lastActive: serverTimestamp()
                }
            }
        }, { merge: true });
    }
  };

  const getTotalLevel = () => charData?.classes.reduce((acc, c) => acc + c.level, 0) || 0;
  const getMaxSpellSlots = () => {
      if(!charData) return [];
      const casterLvl = calculateCasterLevel(charData.classes);
      if (casterLvl === 0) return [];
      return SPELL_SLOT_TABLE[Math.min(casterLvl, 20)] || [];
  };

  // --- Level Up ---
  const startLevelUp = () => {
    setLevelUpPhase('select');
    setLevelUpRoll(null);
    const availableClasses = Object.keys(CLASSES).filter(c => !charData.classes.some(cls => cls.name === c));
    if (availableClasses.length > 0) {
        setLevelUpSelection({ type: 'existing', classIndex: 0, newClassName: availableClasses[0] });
    } else {
        setLevelUpSelection({ type: 'existing', classIndex: 0, newClassName: '' });
    }
    setShowLevelUpModal(true);
  };

  const handleLevelUpRoll = () => {
    const targetClassName = levelUpSelection.type === 'existing' 
        ? charData.classes[levelUpSelection.classIndex].name
        : levelUpSelection.newClassName;
    
    const hitDie = CLASSES[targetClassName].hitDie;
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const conMod = getModifier(charData.stats.con);
    const gain = Math.max(1, roll + conMod);

    setLevelUpRoll({ roll, conMod, gain, hitDie, targetClassName });
    setLevelUpPhase('hp');
  };

  const confirmLevelUp = () => {
    const newClasses = [...charData.classes];
    if (levelUpSelection.type === 'existing') {
        const targetClass = { ...newClasses[levelUpSelection.classIndex] };
        targetClass.level += 1;
        newClasses[levelUpSelection.classIndex] = targetClass;
    } else {
        newClasses.push({ name: levelUpSelection.newClassName, level: 1, subclass: '' });
    }

    const newMaxHp = charData.maxHp + levelUpRoll.gain;
    updateChar({
        ...charData,
        classes: newClasses,
        maxHp: newMaxHp,
        hp: charData.hp + levelUpRoll.gain,
        hitDiceCurrent: charData.hitDiceCurrent + 1
    });
    setShowLevelUpModal(false);
  };
  
  // --- Combat & Attack Logic ---
  const calculateRoll = (bonus, diceCount, diceSides, dmgBonus) => {
      const hitRoll = Math.floor(Math.random() * 20) + 1;
      let damageTotal = 0;
      const actualDiceCount = hitRoll === 20 ? diceCount * 2 : diceCount;
      
      for(let i=0; i<actualDiceCount; i++) {
          damageTotal += Math.floor(Math.random() * diceSides) + 1;
      }
      damageTotal += dmgBonus;
      
      return { hitRoll, damageTotal, isCrit: hitRoll === 20 };
  };

  const performAttack = async (weapon) => {
      const { diceCount, diceSides, bonus } = parseDamage(weapon.dmg);
      const { hitRoll, damageTotal, isCrit } = calculateRoll(weapon.hit, diceCount, diceSides, bonus);

      setAttackResult({ title: weapon.name, hit: hitRoll, hitBonus: weapon.hit, dmg: damageTotal, isCrit });

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`), {
        playerName: charData.name,
        uid: targetUid,
        type: 'attack',
        weapon: weapon.name,
        result: hitRoll,
        hitBonus: weapon.hit,
        damage: damageTotal,
        damageType: weapon.type,
        isCrit: isCrit,
        timestamp: serverTimestamp()
      });
  };

  const castSpell = async (spell) => {
      const slotLvl = spell.level;
      const currentSlots = charData.spellSlots[slotLvl] !== undefined ? charData.spellSlots[slotLvl] : (getMaxSpellSlots()[slotLvl-1] || 0);
      
      if (currentSlots > 0) {
          const newSlots = { ...charData.spellSlots, [slotLvl]: currentSlots - 1 };
          updateChar({ ...charData, spellSlots: newSlots });

          let logData = {
              playerName: charData.name,
              uid: targetUid,
              type: 'spell',
              spellName: spell.name,
              spellType: spell.type,
              level: spell.level,
              result: "Büyü Yapıldı",
              timestamp: serverTimestamp()
          };

          if (spell.type === 'attack' || spell.type === 'damage' || spell.type === 'heal') {
              const { diceCount, diceSides, bonus } = parseDamage(spell.dmg || '0d0');
              let dmgRoll = 0;
              
              // Saldırı zarı atılacak mı? (Attack tipindeyse)
              if (spell.type === 'attack') {
                  // Basit Spell Attack Bonus hesabı: Proficiency + INT/WIS/CHA (Sınıfa göre)
                  // Şimdilik varsayılan +5 alıyoruz basitlik için
                  const spellAttackBonus = 5; 
                  const { hitRoll, damageTotal, isCrit } = calculateRoll(spellAttackBonus, diceCount, diceSides, bonus);
                  dmgRoll = damageTotal;
                  logData.result = hitRoll; // Logda d20 sonucu görünsün
                  logData.hitBonus = spellAttackBonus;
                  logData.damage = damageTotal;
                  logData.isCrit = isCrit;
                  
                  setAttackResult({ title: spell.name, hit: hitRoll, hitBonus: spellAttackBonus, dmg: damageTotal, isCrit });
              } else {
                  // Sadece hasar veya heal (AoE, Save based)
                  for(let i=0; i<diceCount; i++) {
                    dmgRoll += Math.floor(Math.random() * diceSides) + 1;
                  }
                  dmgRoll += bonus;
                  logData.damage = dmgRoll;
                  
                  setAttackResult({ title: spell.name, dmg: dmgRoll, isHeal: spell.type === 'heal' });
              }
          }

          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `room_${roomCode}_rolls`), logData);
      }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Yükleniyor...</div>;

  if (!charData && !isDM) {
      return (
          <div className="p-6 bg-slate-800 rounded-xl border border-slate-600 m-4">
              <h2 className="text-2xl font-bold text-amber-500 mb-4">Karakter Oluştur</h2>
              <div className="space-y-4">
                  <input 
                    placeholder="Karakter Adı" 
                    value={setupData.name} 
                    onChange={e => setSetupData({...setupData, name: e.target.value})}
                    className="w-full p-2 bg-slate-900 rounded border border-slate-600 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={setupData.race} 
                        onChange={e => setSetupData({...setupData, race: e.target.value})}
                        className="p-2 bg-slate-900 rounded border border-slate-600 text-white"
                      >
                          {Object.keys(RACES).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select 
                        value={setupData.class} 
                        onChange={e => setSetupData({...setupData, class: e.target.value})}
                        className="p-2 bg-slate-900 rounded border border-slate-600 text-white"
                      >
                          {Object.keys(CLASSES).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>
                  <select 
                    value={setupData.background} 
                    onChange={e => setSetupData({...setupData, background: e.target.value})}
                    className="w-full p-2 bg-slate-900 rounded border border-slate-600 text-white"
                  >
                      {Object.keys(BACKGROUNDS_DATA).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <button onClick={handleSetupSubmit} className="w-full bg-amber-600 text-white font-bold py-3 rounded">Maceraya Başla</button>
              </div>
          </div>
      );
  }

  if (!charData) return <div className="p-8 text-center text-slate-400">Karakter verisi bulunamadı.</div>;

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full relative">
      
      {/* ATTACK RESULT POPUP */}
      {attackResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200" onClick={() => setAttackResult(null)}>
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center" onClick={e => e.stopPropagation()}>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">{attackResult.title}</h3>
                  
                  {attackResult.hit !== undefined && (
                      <div className="mb-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase font-bold mb-1">Tutturma Zarı (d20)</div>
                          <div className={`text-5xl font-black ${attackResult.isCrit ? 'text-green-400' : attackResult.hit === 1 ? 'text-red-500' : 'text-white'}`}>
                              {attackResult.hit}
                          </div>
                          <div className="text-slate-500 text-sm font-mono mt-1">
                             {attackResult.hit} + {attackResult.hitBonus} = <span className="text-amber-400 font-bold">{attackResult.hit + attackResult.hitBonus}</span>
                          </div>
                      </div>
                  )}

                  <div className="p-4 bg-red-900/20 rounded-xl border border-red-900/50">
                      <div className="text-red-300 text-xs uppercase font-bold mb-1">{attackResult.isHeal ? 'İyileştirme' : 'Hasar'}</div>
                      <div className={`text-6xl font-black ${attackResult.isHeal ? 'text-green-400' : 'text-red-500'}`}>
                          {attackResult.dmg}
                      </div>
                      {attackResult.isCrit && <div className="text-amber-400 font-bold text-sm mt-2 animate-pulse">KRİTİK VURUŞ! (2x Zar)</div>}
                  </div>

                  <button onClick={() => setAttackResult(null)} className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold">Kapat</button>
              </div>
          </div>
      )}

      {/* LEVEL UP MODAL */}
      {showLevelUpModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-amber-500 shadow-2xl">
                  <h3 className="text-2xl font-bold text-amber-500 mb-4 text-center flex items-center justify-center">
                      <ChevronUp className="mr-2" /> Seviye Atla
                  </h3>

                  {levelUpPhase === 'select' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <label className="flex items-center space-x-3 bg-slate-900 p-3 rounded border border-slate-700 cursor-pointer hover:border-amber-500">
                                  <input 
                                    type="radio" 
                                    name="lvtype"
                                    checked={levelUpSelection.type === 'existing'}
                                    onChange={() => setLevelUpSelection({ ...levelUpSelection, type: 'existing' })}
                                    className="text-amber-500 focus:ring-amber-500"
                                  />
                                  <div className="flex-1">
                                      <div className="font-bold text-white">Mevcut Sınıfı Yükselt</div>
                                      <select 
                                        disabled={levelUpSelection.type !== 'existing'}
                                        className="w-full mt-2 bg-slate-800 text-white p-2 rounded text-sm border border-slate-600"
                                        onChange={(e) => setLevelUpSelection({ ...levelUpSelection, classIndex: parseInt(e.target.value) })}
                                      >
                                          {charData.classes.map((c, i) => (
                                              <option key={i} value={i}>{c.name} (Lvl {c.level} {'->'} {c.level + 1})</option>
                                          ))}
                                      </select>
                                  </div>
                              </label>
                          </div>
                          <button onClick={handleLevelUpRoll} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded">
                              Devam Et & Zar At
                          </button>
                          <button onClick={() => setShowLevelUpModal(false)} className="w-full text-slate-400 py-2 text-sm">İptal</button>
                      </div>
                  )}

                  {levelUpPhase === 'hp' && levelUpRoll && (
                      <div className="text-center space-y-6">
                          <div className="text-slate-300">
                              <span className="text-amber-400 font-bold">{levelUpRoll.targetClassName}</span> sınıfında seviye atlıyorsun!
                          </div>
                          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-500 uppercase font-bold mb-2">Can Zarı Sonucu (d{levelUpRoll.hitDie})</div>
                              <div className="text-5xl font-bold text-white mb-2">{levelUpRoll.roll}</div>
                              <div className="text-sm text-slate-400 flex justify-center items-center space-x-2">
                                  <span>Zar: {levelUpRoll.roll}</span>
                                  <span>+</span>
                                  <span>DAY: {formatModifier(levelUpRoll.conMod)}</span>
                                  <span>=</span>
                                  <span className="text-green-400 font-bold text-lg">+{levelUpRoll.gain} Maks Can</span>
                              </div>
                          </div>
                          <button onClick={confirmLevelUp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                              Onayla ve Tamamla
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* READ-ONLY INFO FOR DM */}
      {isDM && targetUid !== user.uid && (
          <div className="bg-amber-900/30 border border-amber-600/50 p-2 rounded text-center text-amber-200 text-xs mb-2">
              <Eye className="inline w-3 h-3 mr-1"/> DM Modu: {charData.name} adlı oyuncuyu düzenliyorsunuz.
          </div>
      )}

      {/* SAVAŞ PANELİ */}
      <div className="bg-slate-800 p-4 rounded-xl border border-red-900/50">
          <h3 className="text-white font-bold mb-2 flex items-center"><Sword className="w-4 h-4 mr-2 text-red-500"/> Savaş & Eylem</h3>
          
          {canEdit && (
             <div className="flex gap-1 mb-4 text-xs">
                 <input placeholder="Silah Adı" className="bg-slate-900 text-white p-1 rounded flex-1" value={newWeapon.name} onChange={e=>setNewWeapon({...newWeapon, name:e.target.value})} />
                 <input placeholder="+Hit" type="number" className="bg-slate-900 text-white p-1 rounded w-12" value={newWeapon.hit} onChange={e=>setNewWeapon({...newWeapon, hit:parseInt(e.target.value)})} />
                 <input placeholder="1d8+3" className="bg-slate-900 text-white p-1 rounded w-16" value={newWeapon.dmg} onChange={e=>setNewWeapon({...newWeapon, dmg:e.target.value})} />
                 <button onClick={() => {
                     if(newWeapon.name) {
                         updateChar({...charData, weapons: [...(charData.weapons||[]), {id:Date.now(), ...newWeapon}]});
                         setNewWeapon({name:'', hit:0, dmg:'1d6', type:'slashing'});
                     }
                 }} className="bg-green-600 text-white px-2 rounded"><Plus className="w-3 h-3"/></button>
             </div>
          )}

          <div className="space-y-2">
              {/* Silahlar */}
              {(charData.weapons || []).map(w => (
                  <div key={w.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700 hover:border-red-500/50 transition-colors">
                      <div>
                          <div className="text-white font-bold text-sm">{w.name}</div>
                          <div className="text-slate-500 text-xs">Hit: +{w.hit} | Dmg: {w.dmg}</div>
                      </div>
                      <div className="flex items-center">
                        <button 
                            onClick={() => performAttack(w)}
                            className="bg-red-900/80 hover:bg-red-700 text-white text-xs px-3 py-1 rounded flex items-center mr-2"
                        >
                            <Target className="w-3 h-3 mr-1"/> Saldır
                        </button>
                        {canEdit && (
                            <button onClick={()=>updateChar({...charData, weapons: charData.weapons.filter(i=>i.id!==w.id)})} className="text-slate-600 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                        )}
                      </div>
                  </div>
              ))}

              {/* Saldırı Büyüleri */}
              {(charData.spells || []).filter(s => s.type === 'attack' || s.type === 'damage' || s.type === 'heal').map(s => {
                   const maxSlots = getMaxSpellSlots();
                   const currentSlots = charData.spellSlots[s.level] !== undefined ? charData.spellSlots[s.level] : (maxSlots[s.level-1] || 0);
                   const hasSlot = currentSlots > 0;

                   return (
                      <div key={s.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700 hover:border-purple-500/50">
                          <div>
                              <div className="text-purple-300 font-bold text-sm">{s.name}</div>
                              <div className="text-slate-500 text-xs">{s.level}. Seviye {s.level > 0 && `(${currentSlots} kaldı)`}</div>
                          </div>
                          <button 
                                onClick={() => castSpell(s)}
                                disabled={!hasSlot && s.level > 0}
                                className={`text-xs px-3 py-1 rounded flex items-center ${hasSlot || s.level === 0 ? 'bg-purple-900/80 hover:bg-purple-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                <Flame className="w-3 h-3 mr-1"/> {s.type === 'heal' ? 'İyileştir' : 'Fırlat'}
                            </button>
                      </div>
                   )
              })}
          </div>
      </div>
      
      {/* HEADER (Name & Level Up) */}
      <div className="flex justify-between items-start bg-slate-800 p-4 rounded-xl border border-slate-700">
            <input 
              value={charData.name} 
              onChange={(e) => updateChar({...charData, name: e.target.value})}
              className="bg-transparent text-2xl font-bold text-white w-2/3 border-b border-slate-600 focus:border-amber-500 outline-none"
              placeholder="Karakter Adı"
              disabled={!canEdit}
            />
            {charData.classes.length > 0 && canEdit && (
                <button onClick={startLevelUp} className="bg-amber-600/80 text-white p-2 rounded-full animate-pulse hover:bg-amber-600">
                    <ChevronUp className="w-4 h-4" />
                </button>
            )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {STAT_ORDER.map((stat) => (
          <div key={stat} className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-center">
            <div className="text-slate-500 text-[10px] font-bold mb-1">{STAT_LABELS[stat]}</div>
            {canEdit ? (
                <input 
                type="number"
                value={charData.stats[stat] || 10}
                onChange={(e) => {
                    const newStats = { ...charData.stats, [stat]: parseInt(e.target.value) || 10 };
                    updateChar({ ...charData, stats: newStats });
                }}
                className="bg-transparent text-white text-xl font-bold w-full text-center outline-none"
                />
            ) : (
                <div className="text-white text-xl font-bold">{charData.stats[stat]}</div>
            )}
            <div className="text-amber-500 text-sm font-bold mt-1 bg-slate-900 rounded py-0.5">
              {formatModifier(getModifier(charData.stats[stat] || 10))}
            </div>
          </div>
        ))}
      </div>

      {/* İşlevsel Büyüler (Savaş dışı veya buff) */}
      {canEdit && (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center text-blue-300 font-bold mb-4"><Zap className="w-4 h-4 mr-2"/> <span>Diğer Büyüler</span></div>
            <div className="space-y-1">
                {(charData.spells || []).filter(s => s.type === 'utility').map(s => {
                   const maxSlots = getMaxSpellSlots();
                   const currentSlots = charData.spellSlots[s.level] !== undefined ? charData.spellSlots[s.level] : (maxSlots[s.level-1] || 0);
                   const hasSlot = currentSlots > 0;
                   return (
                       <div key={s.id} className="flex justify-between items-center bg-slate-900/50 p-2 rounded text-sm">
                           <span className="text-slate-300">{s.name}</span>
                           <button 
                                onClick={() => castSpell(s)} 
                                disabled={!hasSlot && s.level > 0}
                                className={`text-xs px-2 py-1 rounded ${hasSlot || s.level === 0 ? 'bg-blue-900 text-white hover:bg-blue-700' : 'bg-slate-700 text-slate-500'}`}
                            >
                                Kullan ({s.level})
                            </button>
                       </div>
                   )
                })}
            </div>

            {/* Büyü Ekleme */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-700">
                <select 
                    onChange={(e) => e.target.value && setSelectedSpellObj(JSON.parse(e.target.value))}
                    className="flex-1 bg-slate-900 text-slate-300 p-2 rounded text-sm border border-slate-600 outline-none"
                >
                    <option value="">Büyü Öğren...</option>
                    {SPELL_DB.map(s => <option key={s.name} value={JSON.stringify(s)}>{s.level}.Sv - {s.name}</option>)}
                </select>
                <button 
                    onClick={() => {
                        if(selectedSpellObj) {
                            updateChar({ ...charData, spells: [...(charData.spells||[]), { id: Date.now(), name: selectedSpellObj.name, level: selectedSpellObj.level, type: selectedSpellObj.type, dmg: selectedSpellObj.dmg }]});
                            setSelectedSpellObj(null);
                        }
                    }}
                    className="bg-purple-600 text-white p-2 rounded"
                ><Plus className="w-4 h-4"/></button>
            </div>
        </div>
      )}
    </div>
  );
};

// 4. PARTİ GÖRÜNÜMÜ (DM için Seçim Listesi)
const PartyView = ({ roomCode, currentUserUid, role, onSelectPlayer, selectedPlayerId }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!roomCode) return;

    const presenceRef = doc(db, 'artifacts', appId, 'public', 'data', 'presence', roomCode);
    const unsubscribe = onSnapshot(presenceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.players) {
            setPlayers(Object.values(data.players));
        }
      }
    });
    return () => unsubscribe();
  }, [roomCode]);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-amber-500 mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2" /> Maceracılar
      </h2>
      
      <div className="grid gap-4">
        {players.length === 0 ? (
          <p className="text-slate-500 text-center">Henüz kimse görünmüyor...</p>
        ) : (
          players.map(p => (
            <div 
                key={p.uid} 
                onClick={() => role === 'dm' && onSelectPlayer(p.uid)}
                className={`bg-slate-800 p-4 rounded-xl border shadow-lg flex items-center transition-all
                    ${p.uid === selectedPlayerId ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-700'}
                    ${role === 'dm' ? 'cursor-pointer hover:bg-slate-750' : ''}
                `}
            >
              <div className="bg-slate-700 p-3 rounded-full mr-4 relative">
                <Sword className="w-6 h-6 text-slate-300" />
                {p.hp <= 0 && (
                  <div className="absolute inset-0 bg-red-900/80 rounded-full flex items-center justify-center">
                    <Skull className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-white text-lg">{p.name}</h3>
                  <span className="text-xs text-slate-400">Lvl {p.level} {p.class}</span>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>HP</span>
                    <span className={p.hp < p.maxHp / 2 ? 'text-red-400' : 'text-green-400'}>{p.hp}/{p.maxHp}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${p.hp <= 0 ? 'bg-slate-600' : 'bg-green-600'}`}
                      style={{ width: `${(p.hp / (p.maxHp || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {role === 'dm' && (
                    <div className="mt-2 text-[10px] text-amber-500 flex items-center justify-end">
                        <Edit3 className="w-3 h-3 mr-1"/> Düzenlemek için tıkla
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 5. ANA UYGULAMA
export default function App() {
  const [user, setUser] = useState(null);
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [activeTab, setActiveTab] = useState('dice');
  const [role, setRole] = useState('player'); // Varsayılan
  const [selectedPlayerId, setSelectedPlayerId] = useState(null); // DM için seçili oyuncu
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const shareLink = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    if (roomCode) {
      url.searchParams.set('room', roomCode);
    }
    return url.toString();
  }, [roomCode]);

  useEffect(() => {
    const initAuth = async () => {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleJoin = (userName, room, selectedRole) => {
    if (user) {
      user.displayName = userName;
      setRoomCode(room);
      setRole(selectedRole);
      setJoined(true);
      
      // Eğer rol oyuncuysa kendi karakterini seçili yap, DM ise boş başla
      if(selectedRole === 'player') {
          setSelectedPlayerId(user.uid);
      }
    }
  };

  const handleDMSelectPlayer = (uid) => {
      setSelectedPlayerId(uid);
      setActiveTab('char'); // Seçince direkt kağıda git
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 1500);
    } catch (error) {
      window.prompt('Oda linkini kopyala', shareLink);
    }
  };

  if (!user) return <div className="flex items-center justify-center h-screen bg-slate-900 text-amber-500">Büyü hazırlanıyor...</div>;
  
  if (!joined) return <Lobby onJoin={handleJoin} />;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <header className="bg-slate-800 p-4 shadow-md border-b border-slate-700 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-amber-500">Oda: {roomCode}</span>
          {usingDemoConfig && (
            <span className="text-xs px-2 py-1 bg-amber-900/40 border border-amber-700 text-amber-200 rounded-full">
              Demo Firebase
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-sm text-slate-400">
            <button
              onClick={handleCopyShareLink}
              disabled={!roomCode}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition-colors ${roomCode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-slate-700 text-slate-600 cursor-not-allowed'}`}
            >
              <Link2 className="w-4 h-4" />
              <span>{copiedShareLink ? 'Kopyalandı!' : 'Odayı Paylaş'}</span>
            </button>
            {role === 'dm' && <Crown className="w-4 h-4 text-amber-400" />}
            {role === 'spectator' && <Eye className="w-4 h-4 text-blue-400" />}
            <span>{user.displayName}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dice' && <DiceRoller user={user} roomCode={roomCode} />}
        
        {/* Karakter Kağıdı: Oyuncu kendi kağıdını, DM seçili kağıdı görür */}
        {activeTab === 'char' && role !== 'spectator' && (
            <CharacterSheet 
                user={user} 
                roomCode={roomCode} 
                targetUid={selectedPlayerId} 
                isDM={role === 'dm'}
            />
        )}
        
        {/* Parti Görünümü: Herkes görür ama DM tıklayabilir */}
        {activeTab === 'party' && (
            <PartyView 
                roomCode={roomCode} 
                currentUserUid={user.uid} 
                role={role}
                onSelectPlayer={handleDMSelectPlayer}
                selectedPlayerId={selectedPlayerId}
            />
        )}
      </main>

      <nav className="bg-slate-800 border-t border-slate-700 p-2 pb-safe">
        <div className="flex justify-around items-center">
          {role !== 'spectator' && (
              <button 
                onClick={() => setActiveTab('char')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'char' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Scroll className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{role === 'dm' ? 'Düzenle' : 'Karakter'}</span>
              </button>
          )}

          <button 
            onClick={() => setActiveTab('dice')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors transform -translate-y-4 bg-slate-800 border-4 border-slate-900 shadow-lg rounded-full w-16 h-16 justify-center ${activeTab === 'dice' ? 'text-amber-500 ring-2 ring-amber-500' : 'text-slate-400'}`}
          >
            <Dices className={`w-8 h-8 ${activeTab === 'dice' ? 'animate-spin-slow' : ''}`} />
          </button>

          <button 
            onClick={() => setActiveTab('party')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'party' ? 'text-amber-500 bg-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Parti</span>
          </button>
        </div>
      </nav>

      <style>{`
        .text-shadow { text-shadow: 2px 2px 0px rgba(0,0,0,0.3); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        @keyframes zoom-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-in { animation: zoom-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
