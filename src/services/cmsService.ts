import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { RuleDocument, SpellDocument, WeaponDocument, Language } from '../types/cms';
import rulesDataRaw from '../data/rules.json';
import spellsDataRaw from '../data/spells.json';
import { QuickReferenceData, SpellsData } from '../types/rules';

const RULES_COLLECTION = `artifacts/${appId}/rules`;
const SPELLS_COLLECTION = `artifacts/${appId}/spells`;
const WEAPONS_COLLECTION = `artifacts/${appId}/weapons`;

const rulesData = rulesDataRaw as unknown as QuickReferenceData;
const spellsData = spellsDataRaw as unknown as SpellsData;

const sanitizeData = (data: any) => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
};

export const cmsService = {
  // --- Rules ---
  async getRules(language: Language): Promise<RuleDocument[]> {
    const q = query(
      collection(db, RULES_COLLECTION),
      where('language', '==', language),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RuleDocument));
  },

  async getRule(id: string): Promise<RuleDocument | null> {
    const docRef = doc(db, RULES_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as RuleDocument) : null;
  },

  async saveRule(rule: Partial<RuleDocument>) {
    const data = sanitizeData(rule);
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
  async getSpells(language: Language): Promise<SpellDocument[]> {
    const q = query(
      collection(db, SPELLS_COLLECTION),
      where('language', '==', language),
      orderBy('level', 'asc'),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpellDocument));
  },

  async saveSpell(spell: Partial<SpellDocument>) {
    const data = sanitizeData(spell);
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
  async getWeapons(language: Language): Promise<WeaponDocument[]> {
    const q = query(
      collection(db, WEAPONS_COLLECTION),
      where('language', '==', language),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeaponDocument));
  },

  async saveWeapon(weapon: Partial<WeaponDocument>) {
    const data = sanitizeData(weapon);
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

  // --- Seeding ---
  async seedDatabase() {
    console.log("Seeding database...");
    // 1. Seed Rules (TR)
    // The structure of rules.json is complex. We'll try to map sections.
    // rulesData.reference[0].contents has sections like "Karakter Yaratma".
    // rulesData.data[0].entries contains the actual content.

    // This is a best-effort mapping because the JSON structure is flattened in 'data'.
    // We will take the 'reference' sections and try to find matching entries in 'data'.

    const sections = rulesData.reference[0].contents;
    // Flatten all data entries to search within them
    const allEntries = rulesData.data.reduce((acc: any[], d: any) => {
        if (d && d.entries && Array.isArray(d.entries)) {
            return acc.concat(d.entries);
        }
        return acc;
    }, []);

    let order = 0;
    for (const section of sections) {
      // Find entries that match the headers in this section
      const sectionContent = allEntries.filter(entry =>
        typeof entry !== 'string' && entry.name && section.headers.includes(entry.name)
      );

      if (sectionContent.length > 0) {
        const ruleDoc: Omit<RuleDocument, 'id'> = {
          language: 'tr',
          title: section.name,
          content: sectionContent,
          order: order++,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Check if exists to avoid duplicates during dev
        const q = query(collection(db, RULES_COLLECTION), where('title', '==', section.name), where('language', '==', 'tr'));
        const snap = await getDocs(q);
        if (snap.empty) {
           await addDoc(collection(db, RULES_COLLECTION), ruleDoc);
           console.log(`Added rule section: ${section.name}`);
        }
      }
    }

    // 2. Seed Spells (TR)
    // Assuming spells.json is mixed or English, but user interface shows Turkish names in parenthesis often.
    // Let's treat them as 'tr' for now since the user said "coklu dil destegi olsun" implying current might be TR or Mixed.
    // Looking at the file content read earlier: "Acid Splash (Asit Sıçraması)" -> It's bilingual titles.
    // We will save them as 'tr' primarily.

    for (const spell of spellsData.spell) {
        // Convert complex objects to string representations for the simple CMS fields for now
        // or keep them as is? The SpellDocument interface uses strings for simplicity in editing.
        // Let's try to format them nicely.

        const spellDoc: Omit<SpellDocument, 'id'> = {
            language: 'tr',
            name: spell.name,
            level: spell.level,
            school: spell.school,
            time: JSON.stringify(spell.time), // Keep raw for now or format? raw is safer.
            range: JSON.stringify(spell.range),
            components: JSON.stringify(spell.components),
            duration: JSON.stringify(spell.duration),
            description: JSON.stringify(spell.entries),
            classes: spell.classes?.fromClassList?.map(c => c.name) || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const q = query(collection(db, SPELLS_COLLECTION), where('name', '==', spell.name), where('language', '==', 'tr'));
        const snap = await getDocs(q);
        if (snap.empty) {
            await addDoc(collection(db, SPELLS_COLLECTION), spellDoc);
            console.log(`Added spell: ${spell.name}`);
        }
    }

    console.log("Seeding complete.");
  }
};
