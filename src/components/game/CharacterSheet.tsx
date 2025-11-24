import React, { useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  collection
} from 'firebase/firestore';
import {
  Sword,
  Plus,
  Trash2,
  Flame,
  ChevronUp,
  Eye,
  Target,
  Zap,
  Book,
  Shield,
  Dices
} from 'lucide-react';
import { calculateCasterLevel, formatModifier, getModifier, parseDamage } from '../../utils/stats.js';
import { db, appId } from '../../lib/firebase';
import { useTranslation } from 'react-i18next';
import { cmsService } from '../../services/cmsService';
import { WeaponDocument, ArmorDocument, BackgroundDocument } from '../../types/cms';

// --- 5eTürkçe (Kanguen) Kural Setleri ---

const STAT_LABELS: any = { str: "KUV", dex: "ÇEV", con: "DAY", int: "ZEK", wis: "AKI", cha: "KAR" };

const SKILLS_LIST = [
  { name: "Akrobasi (Acrobatics)", key: "acrobatics", stat: "dex" },
  { name: "Hayvan Terbiyesi (Animal Handling)", key: "animal_handling", stat: "wis" },
  { name: "Arkana (Arcana)", key: "arcana", stat: "int" },
  { name: "Atletizm (Athletics)", key: "athletics", stat: "str" },
  { name: "Yalan (Deception)", key: "deception", stat: "cha" },
  { name: "Tarih (History)", key: "history", stat: "int" },
  { name: "Sezgi (Insight)", key: "insight", stat: "wis" },
  { name: "Gözdağı (Intimidation)", key: "intimidation", stat: "cha" },
  { name: "Araştırma (Investigation)", key: "investigation", stat: "int" },
  { name: "Tıp (Medicine)", key: "medicine", stat: "wis" },
  { name: "Doğa (Nature)", key: "nature", stat: "int" },
  { name: "Algı (Perception)", key: "perception", stat: "wis" },
  { name: "Performans (Performance)", key: "performance", stat: "cha" },
  { name: "İkna (Persuasion)", key: "persuasion", stat: "cha" },
  { name: "Din (Religion)", key: "religion", stat: "int" },
  { name: "El Çabukluğu (Sleight of Hand)", key: "sleight_of_hand", stat: "dex" },
  { name: "Gizlilik (Stealth)", key: "stealth", stat: "dex" },
  { name: "Hayatta Kalma (Survival)", key: "survival", stat: "wis" }
];

const RACES: any = {
  "İnsan": { bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, skills: [] },
  "Yarı Elf": { bonuses: { cha: 2, dex: 1, con: 1 }, skills: [] },
  "Dağ Cücesi": { bonuses: { str: 2, con: 2 }, skills: [] },
  "Tepe Cücesi": { bonuses: { con: 2, wis: 1 }, skills: [] },
  "Ulu Elf": { bonuses: { dex: 2, int: 1 }, skills: ["perception"] },
  "Orman Elfi": { bonuses: { dex: 2, wis: 1 }, skills: ["perception"] },
  "Kara Elf (Drow)": { bonuses: { dex: 2, cha: 1 }, skills: ["perception"] },
  "Hafif Ayak Buçukluk": { bonuses: { dex: 2, cha: 1 }, skills: ["stealth"] },
  "Tıknaz Buçukluk": { bonuses: { dex: 2, con: 1 }, skills: [] },
  "Ejderdoğan": { bonuses: { str: 2, cha: 1 }, skills: [] },
  "Orman Gnomu": { bonuses: { int: 2, dex: 1 }, skills: [] },
  "Kaya Gnomu": { bonuses: { int: 2, con: 1 }, skills: [] },
  "Yarı Ork": { bonuses: { str: 2, con: 1 }, skills: ["intimidation"] },
  "Tiefling": { bonuses: { int: 1, cha: 2 }, skills: [] }
};

const CLASSES: any = {
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

const SPELL_SLOT_TABLE = [
  [0,0,0,0,0,0,0,0,0], [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0], [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0], [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,0], [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1],
  [4,3,3,3,3,2,2,1,1]
];

// Büyü Veritabanı (Fallback)
const SPELL_DB = [
  { name: "Büyülü Füze (Magic Missile)", level: 1, type: 'damage', dmg: '3d4+3' },
  { name: "Kalkan (Shield)", level: 1, type: 'utility' },
  { name: "Büyücü Zırhı (Mage Armor)", level: 1, type: 'utility' },
  { name: "Yaraları İyileştir (Cure Wounds)", level: 1, type: 'heal', dmg: '1d8' },
  { name: "Şifa Sözü (Healing Word)", level: 1, type: 'heal', dmg: '1d4' },
  { name: "Büyü Sezme (Detect Magic)", level: 1, type: 'utility' },
  { name: "Gök Gürültüsü Dalgası (Thunderwave)", level: 1, type: 'damage', dmg: '2d8' },
  { name: "Uyku (Sleep)", level: 1, type: 'damage', dmg: '5d8' },
  { name: "Yanan Eller (Burning Hands)", level: 1, type: 'damage', dmg: '3d6' },
  { name: "Görünmezlik (Invisibility)", level: 2, type: 'utility' },
  { name: "Puslu Adım (Misty Step)", level: 2, type: 'utility' },
  { name: "Paramparça (Shatter)", level: 2, type: 'damage', dmg: '3d8' },
  { name: "Kişiyi Tutma (Hold Person)", level: 2, type: 'utility' },
  { name: "Düşük Restorasyon (Lesser Restoration)", level: 2, type: 'utility' },
  { name: "Ruhani Silah (Spiritual Weapon)", level: 2, type: 'attack', dmg: '1d8' },
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

interface CharacterSheetProps {
  user: any;
  roomCode: string;
  targetUid: string | null;
  isDM: boolean;
}

export const CharacterSheet = ({ user, roomCode, targetUid, isDM }: CharacterSheetProps) => {
  const { t } = useTranslation();
  const [charData, setCharData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CMS Data
  const [libraryWeapons, setLibraryWeapons] = useState<WeaponDocument[]>([]);
  const [libraryArmors, setLibraryArmors] = useState<ArmorDocument[]>([]);
  const [libraryBackgrounds, setLibraryBackgrounds] = useState<BackgroundDocument[]>([]);
  const [showWeaponLibrary, setShowWeaponLibrary] = useState(false);

  // Level Up UI
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpPhase, setLevelUpPhase] = useState('select');
  const [levelUpSelection, setLevelUpSelection] = useState({ type: 'existing', classIndex: 0, newClassName: '' });
  const [levelUpRoll, setLevelUpRoll] = useState<any>(null);

  // Attack Result Popup
  const [attackResult, setAttackResult] = useState<any>(null);
  const [attackMode, setAttackMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  // Item & Spell Input
  const [selectedSpellObj, setSelectedSpellObj] = useState<any>(null);
  const [newWeapon, setNewWeapon] = useState({ name: '', hit: 0, dmg: '1d6', type: 'slashing' });

  const canEdit = isDM || (user.uid === targetUid);

  const [setupData, setSetupData] = useState({ name: '', race: 'İnsan', class: 'Savaşçı', background: '' });

  // Fetch CMS Data
  useEffect(() => {
      const fetchData = async () => {
          const w = await cmsService.getWeapons();
          const a = await cmsService.getArmors();
          const b = await cmsService.getBackgrounds();
          setLibraryWeapons(w);
          setLibraryArmors(a);
          setLibraryBackgrounds(b);
          if (b.length > 0) setSetupData(prev => ({ ...prev, background: b[0].name }));
      };
      fetchData();
  }, []);

  useEffect(() => {
    if (!targetUid || !roomCode) return;

    const docRef = doc(db, 'artifacts', appId, 'users', targetUid, 'characters', `room_${roomCode}`);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.classes) data.classes = [];
        if (!data.race) data.race = 'İnsan';
        if (!data.background) data.background = '';
        if (!data.skills) data.skills = [];
        if (!data.weapons) data.weapons = [];
        setCharData(data);
      } else {
        setCharData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [targetUid, roomCode, isDM]);

  const handleSetupSubmit = async () => {
      if (!targetUid) return;

      // Find selected background skills
      let startingSkills: string[] = [];
      const selectedBg = libraryBackgrounds.find(b => b.name === setupData.background);
      if (selectedBg && selectedBg.bonuses?.skills) {
          startingSkills = [...selectedBg.bonuses.skills];
      }

      // Add Race skills
      const raceSkills = RACES[setupData.race]?.skills || [];
      startingSkills = [...new Set([...startingSkills, ...raceSkills])];

      const newData = {
          name: setupData.name,
          race: setupData.race,
          background: setupData.background,
          classes: [{ name: setupData.class, level: 1, subclass: '' }],
          hp: 12, maxHp: 12, hitDiceCurrent: 1,
          stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          inventory: [], spells: [], spellSlots: {},
          skills: startingSkills,
          weapons: [],
          armor: null, shield: null
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

  const updateChar = async (newData: any) => {
    if (!canEdit || !targetUid) return;
    setCharData(newData);

    const docRef = doc(db, 'artifacts', appId, 'users', targetUid, 'characters', `room_${roomCode}`);
    await setDoc(docRef, newData, { merge: true });

    if (newData.classes || newData.hp || newData.maxHp || newData.name) {
        const totalLevel = (newData.classes || []).reduce((acc: number, c: any) => acc + c.level, 0);
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

  const getMaxSpellSlots = () => {
      if(!charData) return [];
      const casterLvl = calculateCasterLevel(charData.classes);
      if (casterLvl === 0) return [];
      return SPELL_SLOT_TABLE[Math.min(casterLvl, 20)] || [];
  };

  const calculateAC = () => {
      if (!charData) return 10;
      let ac = 10;
      let dexMod = getModifier(charData.stats.dex);

      if (charData.armor) {
          ac = charData.armor.ac;
          if (charData.armor.dexBonus === 'None') {
              dexMod = 0;
          } else if (charData.armor.dexBonus === 'Max 2') {
              dexMod = Math.min(dexMod, 2);
          }
          // Full applies normal dexMod
      }

      ac += dexMod;

      if (charData.shield) {
          ac += charData.shield.ac;
      }

      // Unarmored Defense (Monk/Barbarian) could be added here later
      return ac;
  };

  // --- Level Up ---
  const startLevelUp = () => {
    setLevelUpPhase('select');
    setLevelUpRoll(null);
    const availableClasses = Object.keys(CLASSES).filter(c => !charData.classes.some((cls: any) => cls.name === c));
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
  const calculateRoll = (bonus: number, diceCount: number, diceSides: number, dmgBonus: number) => {
      let roll1 = Math.floor(Math.random() * 20) + 1;
      let roll2 = Math.floor(Math.random() * 20) + 1;
      let hitRoll = roll1;

      if (attackMode === 'advantage') hitRoll = Math.max(roll1, roll2);
      if (attackMode === 'disadvantage') hitRoll = Math.min(roll1, roll2);

      let damageTotal = 0;
      const actualDiceCount = hitRoll === 20 ? diceCount * 2 : diceCount;

      for(let i=0; i<actualDiceCount; i++) {
          damageTotal += Math.floor(Math.random() * diceSides) + 1;
      }
      damageTotal += dmgBonus;

      return { hitRoll, damageTotal, isCrit: hitRoll === 20 };
  };

  const performAttack = async (weapon: any) => {
      if (!targetUid) return;
      const { diceCount, diceSides, bonus } = parseDamage(weapon.dmg);
      const { hitRoll, damageTotal, isCrit } = calculateRoll(weapon.hit, diceCount, diceSides, bonus);

      setAttackResult({ title: weapon.name, hit: hitRoll, hitBonus: weapon.hit, dmg: damageTotal, isCrit, mode: attackMode });

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
        mode: attackMode,
        timestamp: serverTimestamp()
      });
  };

  const castSpell = async (spell: any) => {
      if (!targetUid) return;
      const slotLvl = spell.level;
      const currentSlots = charData.spellSlots[slotLvl] !== undefined ? charData.spellSlots[slotLvl] : (getMaxSpellSlots()[slotLvl-1] || 0);

      if (currentSlots > 0) {
          const newSlots = { ...charData.spellSlots, [slotLvl]: currentSlots - 1 };
          updateChar({ ...charData, spellSlots: newSlots });

          let logData: any = {
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
                  logData.mode = attackMode;

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

  const addWeaponFromLibrary = (weapon: WeaponDocument) => {
      // Auto-Calculate Hit Bonus roughly
      // If Finesse -> Max(Str, Dex), Range -> Dex, else Str
      const props = weapon.properties || [];
      const isFinesse = props.includes('Finesse');
      const isRanged = props.includes('Ranged') || weapon.category?.includes('Ranged');

      const strMod = getModifier(charData.stats.str);
      const dexMod = getModifier(charData.stats.dex);

      let abilityMod = strMod;
      if (isRanged) abilityMod = dexMod;
      else if (isFinesse) abilityMod = Math.max(strMod, dexMod);

      // Proficiency? Assume yes for now or 2
      const prof = 2; // Fixed for Level 1, should calculate based on level
      const hitBonus = abilityMod + prof;

      // Damage Bonus? Matches Ability Mod
      const dmgBonus = abilityMod;

      // Parse existing damage string from CMS (e.g., "1d8") and add bonus
      // We need to reconstruct the damage string "1d8+3"
      const baseDmg = weapon.damage || "1d4";
      const dmgString = `${baseDmg}${dmgBonus >= 0 ? '+' + dmgBonus : dmgBonus}`;

      const newWep = {
          id: Date.now(),
          name: weapon.name,
          hit: hitBonus,
          dmg: dmgString,
          type: weapon.damageType
      };

      updateChar({...charData, weapons: [...(charData.weapons||[]), newWep]});
      setShowWeaponLibrary(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;

  if (!charData && !isDM) {
      return (
          <div className="p-6 bg-slate-800 rounded-xl border border-slate-600 m-4">
              <h2 className="text-2xl font-bold text-amber-500 mb-4">{t('character.create_title')}</h2>
              <div className="space-y-4">
                  <input
                    placeholder={t('character.name')}
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
                  <div>
                    <label className="text-xs text-gray-400">Background (CMS)</label>
                    <select
                        value={setupData.background}
                        onChange={e => setSetupData({...setupData, background: e.target.value})}
                        className="w-full p-2 bg-slate-900 rounded border border-slate-600 text-white"
                    >
                        {libraryBackgrounds.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSetupSubmit} className="w-full bg-amber-600 text-white font-bold py-3 rounded">{t('character.start_adventure')}</button>
              </div>
          </div>
      );
  }

  if (!charData) return <div className="p-8 text-center text-slate-400">{t('character.no_data')}</div>;

  const currentAC = calculateAC();

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full relative">

      {/* ATTACK RESULT POPUP */}
      {attackResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200" onClick={() => setAttackResult(null)}>
              <div className="bg-slate-800 p-8 rounded-2xl border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center" onClick={(e: any) => e.stopPropagation()}>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wider">{attackResult.title}</h3>
                  {attackResult.mode !== 'normal' && (
                      <div className="text-amber-500 font-bold uppercase text-xs mb-2 tracking-widest">{attackResult.mode}</div>
                  )}

                  {attackResult.hit !== undefined && (
                      <div className="mb-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                          <div className="text-slate-400 text-xs uppercase font-bold mb-1">{t('dice.hit_roll')}</div>
                          <div className={`text-5xl font-black ${attackResult.isCrit ? 'text-green-400' : attackResult.hit === 1 ? 'text-red-500' : 'text-white'}`}>
                              {attackResult.hit}
                          </div>
                          <div className="text-slate-500 text-sm font-mono mt-1">
                             {attackResult.hit} + {attackResult.hitBonus} = <span className="text-amber-400 font-bold">{attackResult.hit + attackResult.hitBonus}</span>
                          </div>
                      </div>
                  )}

                  <div className="p-4 bg-red-900/20 rounded-xl border border-red-900/50">
                      <div className="text-red-300 text-xs uppercase font-bold mb-1">{attackResult.isHeal ? t('dice.heal') : t('dice.damage')}</div>
                      <div className={`text-6xl font-black ${attackResult.isHeal ? 'text-green-400' : 'text-red-500'}`}>
                          {attackResult.dmg}
                      </div>
                      {attackResult.isCrit && <div className="text-amber-400 font-bold text-sm mt-2 animate-pulse">{t('dice.crit')} (2x)</div>}
                  </div>

                  <button onClick={() => setAttackResult(null)} className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold">{t('common.close')}</button>
              </div>
          </div>
      )}

      {/* WEAPON LIBRARY MODAL */}
      {showWeaponLibrary && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowWeaponLibrary(false)}>
              <div className="bg-slate-800 p-6 rounded-xl w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Book size={20}/> Silah Kütüphanesi</h3>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {libraryWeapons.map(w => (
                          <div key={w.id} className="bg-slate-700 p-3 rounded flex justify-between items-center hover:bg-slate-600">
                              <div>
                                  <div className="font-bold">{w.name}</div>
                                  <div className="text-xs text-slate-400">{w.category} | {w.damage} {w.damageType}</div>
                              </div>
                              <button
                                onClick={() => addWeaponFromLibrary(w)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500"
                              >Ekle</button>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setShowWeaponLibrary(false)} className="mt-4 bg-slate-900 text-white py-2 rounded">Kapat</button>
              </div>
          </div>
      )}

      {/* LEVEL UP MODAL */}
      {showLevelUpModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-amber-500 shadow-2xl">
                  <h3 className="text-2xl font-bold text-amber-500 mb-4 text-center flex items-center justify-center">
                      <ChevronUp className="mr-2" /> {t('character.level_up')}
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
                                      <div className="font-bold text-white">{t('character.existing_class')}</div>
                                      <select
                                        disabled={levelUpSelection.type !== 'existing'}
                                        className="w-full mt-2 bg-slate-800 text-white p-2 rounded text-sm border border-slate-600"
                                        onChange={(e) => setLevelUpSelection({ ...levelUpSelection, classIndex: parseInt(e.target.value) })}
                                      >
                                          {charData.classes.map((c: any, i: number) => (
                                              <option key={i} value={i}>{c.name} (Lvl {c.level} {'->'} {c.level + 1})</option>
                                          ))}
                                      </select>
                                  </div>
                              </label>
                          </div>
                          <button onClick={handleLevelUpRoll} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded">
                              {t('character.continue_roll')}
                          </button>
                          <button onClick={() => setShowLevelUpModal(false)} className="w-full text-slate-400 py-2 text-sm">{t('common.cancel')}</button>
                      </div>
                  )}

                  {levelUpPhase === 'hp' && levelUpRoll && (
                      <div className="text-center space-y-6">
                          <div className="text-slate-300">
                              <span className="text-amber-400 font-bold">{levelUpRoll.targetClassName}</span> {t('character.class_up_msg')}!
                          </div>
                          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                              <div className="text-xs text-slate-500 uppercase font-bold mb-2">{t('character.hit_dice_result')} (d{levelUpRoll.hitDie})</div>
                              <div className="text-5xl font-bold text-white mb-2">{levelUpRoll.roll}</div>
                              <div className="text-sm text-slate-400 flex justify-center items-center space-x-2">
                                  <span>Zar: {levelUpRoll.roll}</span>
                                  <span>+</span>
                                  <span>{t('character.con_short')}: {formatModifier(levelUpRoll.conMod)}</span>
                                  <span>=</span>
                                  <span className="text-green-400 font-bold text-lg">+{levelUpRoll.gain} {t('character.hp_gain')}</span>
                              </div>
                          </div>
                          <button onClick={confirmLevelUp} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                              {t('character.confirm_complete')}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* READ-ONLY INFO FOR DM */}
      {isDM && targetUid !== user.uid && (
          <div className="bg-amber-900/30 border border-amber-600/50 p-2 rounded text-center text-amber-200 text-xs mb-2">
              <Eye className="inline w-3 h-3 mr-1"/> {t('character.dm_mode', { name: charData.name })}
          </div>
      )}

      {/* HEADER (Name & Level Up) */}
      <div className="flex justify-between items-start bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
                <input
                    value={charData.name}
                    onChange={(e) => updateChar({...charData, name: e.target.value})}
                    className="bg-transparent text-2xl font-bold text-white w-full border-b border-slate-600 focus:border-amber-500 outline-none mb-1"
                    placeholder={t('character.name')}
                    disabled={!canEdit}
                />
                <div className="text-xs text-slate-400 flex gap-2">
                    <span className="bg-slate-700 px-1 rounded">{charData.race}</span>
                    <span className="bg-slate-700 px-1 rounded">{charData.classes[0]?.name} {charData.classes[0]?.level}</span>
                    <span className="bg-slate-700 px-1 rounded">{charData.background}</span>
                </div>
            </div>
            {charData.classes.length > 0 && canEdit && (
                <button onClick={startLevelUp} className="bg-amber-600/80 text-white p-2 rounded-full animate-pulse hover:bg-amber-600">
                    <ChevronUp className="w-4 h-4" />
                </button>
            )}
      </div>

      {/* Stats, AC, HP Row */}
      <div className="grid grid-cols-4 gap-2">
          {/* AC Display */}
          <div className="col-span-1 bg-slate-800 p-2 rounded-lg border border-slate-600 flex flex-col items-center justify-center relative">
               <Shield size={16} className="text-slate-400 mb-1"/>
               <div className="text-2xl font-bold text-white">{currentAC}</div>
               <div className="text-[10px] text-slate-400 font-bold">AC</div>
          </div>

          {/* Stats */}
          {STAT_ORDER.slice(0, 3).map((stat) => (
            <div key={stat} className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-500 text-[10px] font-bold mb-1">{t(`stats.${stat}`)}</div>
                <div className="text-lg font-bold text-white">{charData.stats[stat]}</div>
                <div className="text-amber-500 text-xs font-bold">{formatModifier(getModifier(charData.stats[stat] || 10))}</div>
            </div>
          ))}
          {STAT_ORDER.slice(3, 6).map((stat) => (
            <div key={stat} className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-500 text-[10px] font-bold mb-1">{t(`stats.${stat}`)}</div>
                <div className="text-lg font-bold text-white">{charData.stats[stat]}</div>
                <div className="text-amber-500 text-xs font-bold">{formatModifier(getModifier(charData.stats[stat] || 10))}</div>
            </div>
          ))}
           <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-center flex flex-col justify-center">
               <div className="text-xs text-slate-400">HP</div>
               <div className="text-green-400 font-bold">{charData.hp}/{charData.maxHp}</div>
           </div>
      </div>

      {/* ARMOR & SHIELD SELECTION */}
      {canEdit && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
               <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2"><Shield size={12}/> Zırh & Kalkan</h4>
               <div className="grid grid-cols-2 gap-2">
                   <select
                        className="bg-slate-900 text-white text-xs p-2 rounded border border-slate-600"
                        value={charData.armor?.id || ""}
                        onChange={(e) => {
                            const id = e.target.value;
                            const item = libraryArmors.find(a => a.id === id) || null;
                            updateChar({...charData, armor: item});
                        }}
                    >
                       <option value="">Zırh Yok (10 + Dex)</option>
                       {libraryArmors.filter(a => a.type !== 'Shield').map(a => (
                           <option key={a.id} value={a.id}>{a.name} (AC {a.ac})</option>
                       ))}
                   </select>

                   <select
                        className="bg-slate-900 text-white text-xs p-2 rounded border border-slate-600"
                        value={charData.shield?.id || ""}
                        onChange={(e) => {
                            const id = e.target.value;
                            const item = libraryArmors.find(a => a.id === id) || null;
                            updateChar({...charData, shield: item});
                        }}
                    >
                       <option value="">Kalkan Yok</option>
                       {libraryArmors.filter(a => a.type === 'Shield').map(a => (
                           <option key={a.id} value={a.id}>{a.name} (+{a.ac})</option>
                       ))}
                   </select>
               </div>
          </div>
      )}


      {/* SAVAŞ PANELİ */}
      <div className="bg-slate-800 p-4 rounded-xl border border-red-900/50">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-white font-bold flex items-center"><Sword className="w-4 h-4 mr-2 text-red-500"/> {t('character.combat_action')}</h3>

             {/* Advantage Toggles */}
             <div className="flex bg-slate-900 rounded p-1">
                 <button onClick={()=>setAttackMode('normal')} className={`p-1 rounded text-xs ${attackMode==='normal'?'bg-slate-600 text-white':'text-slate-500'}`}>Normal</button>
                 <button onClick={()=>setAttackMode('advantage')} className={`p-1 rounded text-xs ${attackMode==='advantage'?'bg-green-700 text-white':'text-slate-500'}`}>Adv</button>
                 <button onClick={()=>setAttackMode('disadvantage')} className={`p-1 rounded text-xs ${attackMode==='disadvantage'?'bg-red-700 text-white':'text-slate-500'}`}>Dis</button>
             </div>
          </div>

          {canEdit && (
             <div className="flex gap-2 mb-4 text-xs">
                 <button onClick={() => setShowWeaponLibrary(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded flex items-center justify-center gap-2">
                     <Book size={14}/> Kütüphaneden Ekle
                 </button>

                 {/* Manual Add Toggle could be here, kept simple for now */}
             </div>
          )}

          <div className="space-y-2">
              {/* Silahlar */}
              {(charData.weapons || []).map((w: any) => (
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
                            <Dices className="w-3 h-3 mr-1"/> {t('character.attack')}
                        </button>
                        {canEdit && (
                            <button onClick={()=>updateChar({...charData, weapons: charData.weapons.filter((i: any)=>i.id!==w.id)})} className="text-slate-600 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>
                        )}
                      </div>
                  </div>
              ))}

              {/* Saldırı Büyüleri */}
              {(charData.spells || []).filter((s: any) => s.type === 'attack' || s.type === 'damage' || s.type === 'heal').map((s: any) => {
                   const maxSlots = getMaxSpellSlots();
                   const currentSlots = charData.spellSlots[s.level] !== undefined ? charData.spellSlots[s.level] : (maxSlots[s.level-1] || 0);
                   const hasSlot = currentSlots > 0;

                   return (
                      <div key={s.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700 hover:border-purple-500/50">
                          <div>
                              <div className="text-purple-300 font-bold text-sm">{s.name}</div>
                              <div className="text-slate-500 text-xs">{s.level}. {t('character.level')} {s.level > 0 && `(${currentSlots} ${t('character.remaining')})`}</div>
                          </div>
                          <button
                                onClick={() => castSpell(s)}
                                disabled={!hasSlot && s.level > 0}
                                className={`text-xs px-3 py-1 rounded flex items-center ${hasSlot || s.level === 0 ? 'bg-purple-900/80 hover:bg-purple-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                                <Flame className="w-3 h-3 mr-1"/> {s.type === 'heal' ? t('character.heal') : t('character.cast')}
                            </button>
                      </div>
                   )
              })}
          </div>
      </div>

      {/* Skills Display (Auto-populated from Background) */}
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
           <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Yetenekler (Skills)</div>
           <div className="grid grid-cols-2 gap-1">
               {SKILLS_LIST.map(skill => {
                   const isProficient = (charData.skills || []).includes(skill.key || skill.name); // Support legacy name check or key check
                   // Legacy check support: SKILLS_LIST names were "Atletizm (Athletics)"
                   // New CMS uses keys "athletics".
                   // Let's assume we migrated to keys. But the list above has 'key'.

                   // Calculate Bonus
                   let bonus = getModifier(charData.stats[skill.stat]);
                   if (isProficient) bonus += 2; // Fixed prof bonus for now

                   return (
                       <div key={skill.key} className={`text-xs flex justify-between px-2 py-1 rounded ${isProficient ? 'bg-indigo-900/30 text-indigo-200 border border-indigo-500/30' : 'text-slate-500'}`}>
                           <span>{skill.name.split(' (')[0]}</span>
                           <span className={isProficient ? "font-bold" : ""}>{formatModifier(bonus)}</span>
                       </div>
                   )
               })}
           </div>
      </div>

      {/* İşlevsel Büyüler (Savaş dışı veya buff) */}
      {canEdit && (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center text-blue-300 font-bold mb-4"><Zap className="w-4 h-4 mr-2"/> <span>{t('character.other_spells')}</span></div>
            <div className="space-y-1">
                {(charData.spells || []).filter((s: any) => s.type === 'utility').map((s: any) => {
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
                                {t('character.use')} ({s.level})
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
                    <option value="">{t('character.learn_spell')}</option>
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
