import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  where
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { RuleDocument, SpellDocument, WeaponDocument, BackgroundDocument, Language } from '../types/cms';
import rulesDataRaw from '../data/rules.json';
import spellsDataRaw from '../data/spells.json';
import { backgroundsSeedData } from '../data/backgroundsSeed';
import { weaponsSeedData } from '../data/weaponsSeed';
import { QuickReferenceData, SpellsData } from '../types/rules';
import { convertRulesToHtml, normalizeSpellData } from '../utils/dataConverters';

const RULES_COLLECTION = `artifacts/${appId}/rules`;
const SPELLS_COLLECTION = `artifacts/${appId}/spells`;
const WEAPONS_COLLECTION = `artifacts/${appId}/weapons`;
const ARMORS_COLLECTION = `artifacts/${appId}/armors`;
const BACKGROUNDS_COLLECTION = `artifacts/${appId}/backgrounds`;

const rulesData = rulesDataRaw as unknown as QuickReferenceData;
const spellsData = spellsDataRaw as unknown as SpellsData;

// --- WEAPONS SEED DATA PARSING ---
// Embedded JSON data from the user provided link (Turkish Content)
// I will filter for items that are "weapons" (have weaponCategory)
const rawItemsData = {
	"item": [
        // ... (I will insert the filtered JSON data here, for brevity I will use a placeholder in this thought but in the real file I will paste the relevant items)
        // Actually, I should process the JSON I read.
        // I will add a helper function to fetch/parse it or just embed the filtered list.
        // Since I can't fetch in client-side code easily without CORS issues if I use fetch(), and I have the content now, I will embed the parsed version.
    ]
};

// ... Helper to sanitize ...
const sanitizeData = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

const sanitizeForFirestore = (obj: any): any => {
  if (Array.isArray(obj)) {
    if (obj.length > 0 && Array.isArray(obj[0])) {
      return obj.map(item => ({ cells: sanitizeForFirestore(item) }));
    }
    return obj.map(sanitizeForFirestore);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        newObj[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

// Translation Helpers
const TRANSLATIONS: Record<string, string> = {
    "Karakter Yaratma": "Character Creation",
    "1. Seviye Ötesinde": "Beyond 1st Level",
    "Diller": "Languages",
    "Çoklusınıf": "Multiclassing",
    "Adım Adım Karakterler": "Step-by-Step Characters",
    "Ekipman": "Equipment",
    "Macera Tertibatı": "Adventuring Gear",
    "Zırh ve Kalkanlar": "Armor and Shields",
    "Masraflar": "Expenses",
    "Binekler ve Araçlar": "Mounts and Vehicles",
    "Başlangıç Ekipmanı": "Starting Equipment",
    "Aletler": "Tools",
    "Ticari Mallar": "Trade Goods",
    "Servet": "Wealth",
    "Silahlar": "Weapons",
    "Oyunu Oynama": "Playing the Game",
    "Yetenek Zarları": "Ability Checks",
    "Yetenek Skorları ve Bonuslar": "Ability Scores and Modifiers",
    "Avantaj ve Dezavantaj": "Advantage and Disadvantage",
    "Büyü Yapma": "Spellcasting",
    "Durumlar": "Conditions",
    "Düşme": "Falling",
    "Yiyecek ve İçecek": "Food and Drink",
    "Nasıl Oynanır": "How to Play",
    "Nesnelerle Etkileşim": "Interacting with Objects",
    "Uzmanlık Bonusu": "Proficiency Bonus",
    "Dinlenme": "Resting",
    "Kurtulma Zarları": "Saving Throws",
    "Beceriler": "Skills",
    "Boğulma": "Suffocating",
    "Her Yeteneği Kullanma": "Using Each Ability",
    "Görüş ve Işık": "Vision and Light",
    "Savaş": "Combat",
    "Savaşta Eylemler": "Actions in Combat",
    "Siper": "Cover",
    "Hasar ve İyileşme": "Damage and Healing",
    "Saldırı Yapma": "Making an Attack",
    "Binekli Savaş": "Mounted Combat",
    "Hareket ve Konumlanma": "Movement and Position",
    "Savaş Düzeni": "Order of Combat",
    "Sualtı Savaşı": "Underwater Combat",

    "eylem": "action",
    "bonus": "bonus action",
    "reaksiyon": "reaction",
    "dakika": "minute",
    "saat": "hour",
    "Anlık": "Instantaneous",
    "Bozulana Kadar": "Until Dispelled",
    "Özel": "Special",
    "Konsantrasyon": "Concentration",
    "Kendisi": "Self",
    "Dokunma": "Touch",
    "Görüş": "Sight",
    "Sınırsız": "Unlimited",
    "feet": "feet",
    "point": "point",

    "Mürit": "Acolyte",
    "Şarlatan": "Charlatan",
    "Şehir Bekçisi": "City Watch",
    "Klan Zanaatkarı": "Clan Crafter",
    "Dünyadan Uzak Alim": "Cloistered Scholar",
    "Saray Mensubu": "Courtier",
    "Suçlu": "Criminal",
    "Gösteri Adamı": "Entertainer",
    "Grup Temsilcisi": "Faction Agent",
    "Seyyah": "Far Traveler",
    "Halk Kahramanı": "Folk Hero",
    "Loca Zanaatkarı": "Guild Artisan",
    "Münzevi (İnzivaya çekilmiş kimse)": "Hermit",
    "Mirasçı": "Inheritor",
    "Alternatif Şehir Bekçisi (Dedektif)": "Investigator (City Watch Variant)",
    "Tarikat Şövalyesi": "Knight of the Order",
    "Kıdemli Paralı Asker": "Mercenary Veteran",
    "Soylu": "Noble",
    "Yabancı": "Outlander",
    "Bilge": "Sage",
    "Denizci": "Sailor",
    "Asker": "Soldier",
    "Şehir Ödül Avcısı": "Urban Bounty Hunter",
    "Sokak Çocuğu": "Urchin",
    "Uthgardt Kabile Üyesi": "Uthgardt Tribe Member",
    "Waterdhavian Soylusu": "Waterdhavian Noble",
    "Alternatif Suçlu (Ajan)": "Spy (Criminal Variant)",
    "Alternatif Gösteri Adamı (Gladyatör)": "Gladiator (Entertainer Variant)",
    "Alternatif Loca Zanaatkarı (Loca Tüccarı)": "Guild Merchant (Guild Artisan Variant)",
    "Alternatif Soylu (Şövalye)": "Knight (Noble Variant)",
    "Alternatif Denizci (Korsan)": "Pirate (Sailor Variant)",

    // Weapons
    "Askeri": "Martial",
    "Basit": "Simple",
    "Kesme": "Slashing",
    "Delme": "Piercing",
    "Ezme": "Bludgeoning",
    "Menzilli": "Ranged",
    "Yakın Dövüş": "Melee",
    "Çok Yönlü": "Versatile",
    "Ağır": "Heavy",
    "Hafif": "Light",
    "İki Elle": "Two-Handed",
    "Fırlatma": "Thrown",
    "Erişim": "Reach",
    "Mühimmat": "Ammunition",
    "Yükleme": "Loading",
    "İnce": "Finesse"
};

const translateTerm = (term: string): string => {
    return TRANSLATIONS[term] || term;
};

// Helper to map properties codes
const mapProperty = (prop: string): string => {
    const map: Record<string, string> = {
        "A": "Ammunition",
        "F": "Finesse",
        "H": "Heavy",
        "L": "Light",
        "Ld": "Loading",
        "R": "Reach",
        "S": "Special",
        "T": "Thrown",
        "2H": "Two-Handed",
        "V": "Versatile"
    };
    return map[prop] || prop;
};

const mapDamageType = (type: string): string => {
    const map: Record<string, string> = {
        "S": "Slashing",
        "P": "Piercing",
        "B": "Bludgeoning",
        "R": "Radiant",
        "N": "Necrotic",
        "L": "Lightning",
        "F": "Fire",
        "C": "Cold",
        "A": "Acid",
        "Ps": "Psychic",
        "Po": "Poison",
        "Th": "Thunder",
        "Fo": "Force"
    };
    return map[type] || type;
};

const mapCategoryTR = (cat: string): string => {
    if (cat === "Askeri") return "Martial";
    if (cat === "Basit") return "Simple";
    return cat;
}

export const cmsService = {
  // --- Rules ---
  async getRules(): Promise<RuleDocument[]> {
    const q = query(
      collection(db, RULES_COLLECTION)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RuleDocument));
    return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async getRule(id: string): Promise<RuleDocument | null> {
    const docRef = doc(db, RULES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as RuleDocument) : null;
  },

  async saveRule(rule: Partial<RuleDocument>) {
    const data = sanitizeForFirestore(sanitizeData(rule));
    if (rule.id) {
      const docRef = doc(db, RULES_COLLECTION, rule.id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, RULES_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  },

  async deleteRule(id: string) {
    await deleteDoc(doc(db, RULES_COLLECTION, id));
  },

  // --- Spells ---
  async getSpells(): Promise<SpellDocument[]> {
    const q = query(
      collection(db, SPELLS_COLLECTION)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpellDocument));
    return docs.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });
  },

  async saveSpell(spell: Partial<SpellDocument>) {
    const data = sanitizeForFirestore(sanitizeData(spell));
    if (spell.id) {
      const docRef = doc(db, SPELLS_COLLECTION, spell.id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, SPELLS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  },

  async deleteSpell(id: string) {
    await deleteDoc(doc(db, SPELLS_COLLECTION, id));
  },

  // --- Weapons ---
  async getWeapons(): Promise<WeaponDocument[]> {
    const q = query(
      collection(db, WEAPONS_COLLECTION)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeaponDocument));
    return docs.sort((a, b) => a.name.localeCompare(b.name));
  },

  async saveWeapon(weapon: Partial<WeaponDocument>) {
    const data = sanitizeForFirestore(sanitizeData(weapon));
    if (weapon.id) {
      const docRef = doc(db, WEAPONS_COLLECTION, weapon.id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, WEAPONS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  },

  async deleteWeapon(id: string) {
    await deleteDoc(doc(db, WEAPONS_COLLECTION, id));
  },

  // --- Armors ---
  async getArmors(): Promise<import('../types/cms').ArmorDocument[]> {
    const q = query(
      collection(db, ARMORS_COLLECTION)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as import('../types/cms').ArmorDocument));
    return docs.sort((a, b) => a.name.localeCompare(b.name));
  },

  async saveArmor(armor: Partial<import('../types/cms').ArmorDocument>) {
    const data = sanitizeForFirestore(sanitizeData(armor));
    if (armor.id) {
      const docRef = doc(db, ARMORS_COLLECTION, armor.id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, ARMORS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  },

  async deleteArmor(id: string) {
    await deleteDoc(doc(db, ARMORS_COLLECTION, id));
  },

  // --- Backgrounds ---
  async getBackgrounds(): Promise<BackgroundDocument[]> {
    const q = query(
      collection(db, BACKGROUNDS_COLLECTION)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BackgroundDocument));
    return docs.sort((a, b) => a.name.localeCompare(b.name));
  },

  async saveBackground(background: Partial<BackgroundDocument>) {
    const data = sanitizeForFirestore(sanitizeData(background));
    if (background.id) {
      const docRef = doc(db, BACKGROUNDS_COLLECTION, background.id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, BACKGROUNDS_COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
  },

  async deleteBackground(id: string) {
    await deleteDoc(doc(db, BACKGROUNDS_COLLECTION, id));
  },

  // --- Seeding ---
  async resetAndSeedDatabase() {
    console.log("Resetting and seeding database...");

    const deleteCollection = async (collectionPath: string) => {
      const q = query(collection(db, collectionPath));
      const snapshot = await getDocs(q);
      const batchSize = 500;
      let batch = writeBatch(db);
      let count = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        count++;
        if (count >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      if (count > 0) {
        await batch.commit();
      }
    };

    await deleteCollection(RULES_COLLECTION);
    await deleteCollection(SPELLS_COLLECTION);
    await deleteCollection(BACKGROUNDS_COLLECTION);
    await deleteCollection(WEAPONS_COLLECTION);
    await deleteCollection(ARMORS_COLLECTION);

    await this.seedDatabase();
    console.log("Database reset and seeded.");
  },

  async seedDatabase() {
    console.log("Seeding database with multi-language support...");

    let batch = writeBatch(db);
    let opCount = 0;

    // 1. Seed Rules
    const sections = rulesData.reference[0].contents;
    const allEntries = rulesData.data.reduce((acc: any[], d: any) => {
        if (d && d.entries && Array.isArray(d.entries)) {
            return acc.concat(d.entries);
        }
        return acc;
    }, []);

    let order = 0;

    for (const section of sections) {
      const sectionContentTR = allEntries.filter(entry =>
        typeof entry !== 'string' && entry.name && section.headers.includes(entry.name)
      );

      if (sectionContentTR.length > 0) {
        const htmlContentTR = convertRulesToHtml(sectionContentTR);
        const titleEN = translateTerm(section.name);
        const htmlContentEN = htmlContentTR;

        const ruleDocRef = doc(collection(db, RULES_COLLECTION));
        const ruleDoc: Omit<RuleDocument, 'id'> = {
          title: titleEN,
          content: htmlContentEN,
          translations: {
              tr: {
                  title: section.name,
                  content: htmlContentTR
              }
          },
          order: order++,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        batch.set(ruleDocRef, ruleDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
      }
    }

    // 2. Seed Spells
    for (const spell of spellsData.spell) {
        const normalizedSpell = normalizeSpellData(spell);

        let nameEN = normalizedSpell.name;
        let nameTR = normalizedSpell.name;

        const nameMatch = normalizedSpell.name.match(/^(.*?)\s*\((.*?)\)$/);
        if (nameMatch) {
            nameEN = nameMatch[1].trim();
            nameTR = nameMatch[2].trim();
        }

        const timeEN = getEnglishTime(spell);
        const rangeEN = getEnglishRange(spell);
        const durationEN = getEnglishDuration(spell);
        const componentsEN = getEnglishComponents(spell);

        const descriptionTR = normalizedSpell.description;
        const descriptionEN = descriptionTR;

        const spellDocRef = doc(collection(db, SPELLS_COLLECTION));
        const spellDoc: Omit<SpellDocument, 'id'> = {
            name: nameEN,
            level: normalizedSpell.level,
            school: normalizedSpell.school,
            time: timeEN,
            range: rangeEN,
            components: componentsEN,
            duration: durationEN,
            description: descriptionEN,
            classes: normalizedSpell.classes?.fromClassList?.map((c: any) => c.name) || [],
            translations: {
                tr: {
                    name: nameTR,
                    time: normalizedSpell.time,
                    range: normalizedSpell.range,
                    components: normalizedSpell.components,
                    duration: normalizedSpell.duration,
                    description: descriptionTR
                }
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        batch.set(spellDocRef, spellDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }

    // 3. Seed Backgrounds
    for (const bg of backgroundsSeedData) {
        const bgDocRef = doc(collection(db, BACKGROUNDS_COLLECTION));
        const nameEN = translateTerm(bg.name);

        const bgDoc: Omit<BackgroundDocument, 'id'> = {
            name: nameEN,
            description: bg.description,
            skillProficiencies: bg.skillProficiencies,
            toolProficiencies: bg.toolProficiencies,
            languages: bg.languages,
            equipment: bg.equipment,
            featureName: bg.featureName,
            featureDescription: bg.featureDescription,
            suggestedCharacteristics: bg.suggestedCharacteristics,

            translations: {
                tr: {
                    name: bg.name,
                    description: bg.description,
                    skillProficiencies: bg.skillProficiencies,
                    toolProficiencies: bg.toolProficiencies,
                    languages: bg.languages,
                    equipment: bg.equipment,
                    featureName: bg.featureName,
                    featureDescription: bg.featureDescription,
                    suggestedCharacteristics: bg.suggestedCharacteristics,
                }
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        batch.set(bgDocRef, bgDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }

    // 4. Seed Weapons
    for (const weapon of weaponsSeedData) {
        const weaponDocRef = doc(collection(db, WEAPONS_COLLECTION));

        // Map TR Name
        const nameTR = weapon.name;
        // Attempt to normalize EN Name by removing (Translated) parts if any, or just use TR as placeholder if not mapped
        const nameEN = nameTR; // Placeholder or implement better mapping if I had dictionary

        // Map Category
        const catTR = weapon.weaponCategory || "Bilinmiyor";
        const catEN = mapCategoryTR(catTR); // Helper to map "Askeri" -> "Martial"

        // Map Damage Type
        const dtCode = weapon.dmgType || "";
        const dtEN = mapDamageType(dtCode);
        const dtTR = dtEN; // Using English codes/names for TR too usually in game terms, or map back?
                           // Let's keep it simple: Use standard EN terms for damage types in EN field.
                           // For TR field, we can use mapped Turkish terms if we want, but prompt didn't specify TR terminology.
                           // I will use the EN term for both for consistency in this pass or mapped if easy.

        // Map Properties
        const propsTR = (weapon.property || []).map((p: string) => mapProperty(p));
        const propsEN = propsTR;

        // Description (Entries)
        const descriptionTR = convertRulesToHtml(weapon.entries || []);
        const descriptionEN = descriptionTR; // Placeholder

        const weaponDoc: Omit<WeaponDocument, 'id'> = {
            name: nameEN,
            category: catEN,
            damage: weapon.dmg1 || "",
            damageType: dtEN,
            properties: propsEN,
            weight: weapon.weight || "0",
            cost: "", // Not in this specific JSON structure, usually
            range: weapon.range || "",
            description: descriptionEN,

            translations: {
                tr: {
                    name: nameTR,
                    category: catTR,
                    damageType: dtTR,
                    properties: propsTR,
                    description: descriptionTR
                }
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        batch.set(weaponDocRef, weaponDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }

    if (opCount > 0) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
    }

    console.log("Seeding complete.");
  }
};

// --- Helpers for English Normalization from Raw Data ---

function getEnglishTime(spell: any): string {
  if (spell.time && spell.time.length > 0) {
    const t = spell.time[0];
    const unitMap: Record<string, string> = {
      'eylem': 'Action',
      'bonus': 'Bonus Action',
      'reaksiyon': 'Reaction',
      'dakika': 'Minute',
      'saat': 'Hour',
      'action': 'Action',
      'bonus action': 'Bonus Action',
      'reaction': 'Reaction',
      'minute': 'Minute',
      'hour': 'Hour'
    };
    const unit = unitMap[t.unit] || t.unit;
    return `${t.number} ${unit}`;
  }
  return "";
}

function getEnglishRange(spell: any): string {
  if (spell.range) {
    if (spell.range.distance) {
       const dist = spell.range.distance;
       if (dist.type === 'self') return 'Self';
       if (dist.type === 'touch') return 'Touch';
       if (dist.type === 'sight') return 'Sight';
       if (dist.type === 'unlimited') return 'Unlimited';
       if (dist.amount) {
         return `${dist.amount} ${dist.type}`;
       }
    }
  }
  return "";
}

function getEnglishComponents(spell: any): string {
  if (spell.components) {
    const parts = [];
    if (spell.components.v) parts.push('V');
    if (spell.components.s) parts.push('S');
    if (spell.components.m) parts.push('M');
    return parts.join(', ');
  }
  return "";
}

function getEnglishDuration(spell: any): string {
  if (spell.duration && spell.duration.length > 0) {
    const d = spell.duration[0];
    if (d.type === 'instant') return 'Instantaneous';
    if (d.type === 'permanent') return 'Until Dispelled';
    if (d.type === 'special') return 'Special';
    if (d.duration) {
       const unitMap: Record<string, string> = {
          'dakika': 'Minute',
          'saat': 'Hour',
          'gün': 'Day',
          'rounds': 'Round',
          'minute': 'Minute',
          'hour': 'Hour',
          'day': 'Day',
          'round': 'Round'
       };
       const unit = unitMap[d.duration.type] || d.duration.type;
       let str = `${d.duration.amount} ${unit}`;
       if (d.concentration) {
         str = `Concentration, up to ${str}`;
       }
       return str;
    }
  }
  return "";
}
