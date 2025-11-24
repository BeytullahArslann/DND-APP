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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { RuleDocument, SpellDocument, WeaponDocument, BackgroundDocument, Language } from '../types/cms';
import rulesDataRaw from '../data/rules.json';
import spellsDataRaw from '../data/spells.json';
import { backgroundsSeedData } from '../data/backgroundsSeed';
import { QuickReferenceData, SpellsData } from '../types/rules';
import { convertRulesToHtml, normalizeSpellData } from '../utils/dataConverters';

const RULES_COLLECTION = `artifacts/${appId}/rules`;
const SPELLS_COLLECTION = `artifacts/${appId}/spells`;
const WEAPONS_COLLECTION = `artifacts/${appId}/weapons`;
const BACKGROUNDS_COLLECTION = `artifacts/${appId}/backgrounds`;

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

export const cmsService = {
  // --- Rules ---
  async getRules(language: Language): Promise<RuleDocument[]> {
    const q = query(
      collection(db, RULES_COLLECTION),
      where('language', '==', language)
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
  async getSpells(language: Language): Promise<SpellDocument[]> {
    const q = query(
      collection(db, SPELLS_COLLECTION),
      where('language', '==', language)
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
  async getWeapons(language: Language): Promise<WeaponDocument[]> {
    const q = query(
      collection(db, WEAPONS_COLLECTION),
      where('language', '==', language)
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

  // --- Backgrounds ---
  async getBackgrounds(language: Language): Promise<BackgroundDocument[]> {
    const q = query(
      collection(db, BACKGROUNDS_COLLECTION),
      where('language', '==', language)
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

    // Helper to delete all documents in a collection
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
    // await deleteCollection(WEAPONS_COLLECTION); // Optional, if we had weapons seed data

    await this.seedDatabase();
    console.log("Database reset and seeded.");
  },

  async seedDatabase() {
    console.log("Seeding database...");

    // 1. Seed Rules (TR)
    const sections = rulesData.reference[0].contents;
    // Flatten all data entries to search within them
    const allEntries = rulesData.data.reduce((acc: any[], d: any) => {
        if (d && d.entries && Array.isArray(d.entries)) {
            return acc.concat(d.entries);
        }
        return acc;
    }, []);

    let order = 0;
    let batch = writeBatch(db);
    let opCount = 0;

    for (const section of sections) {
      const sectionContent = allEntries.filter(entry =>
        typeof entry !== 'string' && entry.name && section.headers.includes(entry.name)
      );

      if (sectionContent.length > 0) {
        // Convert content to HTML using the converter
        const htmlContent = convertRulesToHtml(sectionContent);

        const ruleDocRef = doc(collection(db, RULES_COLLECTION));
        const ruleDoc: Omit<RuleDocument, 'id'> = {
          language: 'tr',
          title: section.name,
          content: htmlContent, // Now string (HTML)
          order: order++,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        batch.set(ruleDocRef, ruleDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
      }
    }

    // 2. Seed Spells (TR)
    for (const spell of spellsData.spell) {
        const normalizedSpell = normalizeSpellData(spell);

        const spellDocRef = doc(collection(db, SPELLS_COLLECTION));
        const spellDoc: Omit<SpellDocument, 'id'> = {
            language: 'tr',
            name: normalizedSpell.name,
            level: normalizedSpell.level,
            school: normalizedSpell.school,
            time: normalizedSpell.time,
            range: normalizedSpell.range,
            components: normalizedSpell.components,
            duration: normalizedSpell.duration,
            description: normalizedSpell.description,
            classes: normalizedSpell.classes?.fromClassList?.map((c: any) => c.name) || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        batch.set(spellDocRef, spellDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }

    if (opCount > 0) {
        await batch.commit();
        batch = writeBatch(db);
        opCount = 0;
    }

    // 3. Seed Backgrounds (TR)
    for (const bg of backgroundsSeedData) {
        const bgDocRef = doc(collection(db, BACKGROUNDS_COLLECTION));
        const bgDoc: Omit<BackgroundDocument, 'id'> = {
            ...bg,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        batch.set(bgDocRef, bgDoc);
        opCount++;
        if (opCount >= 400) { await batch.commit(); batch = writeBatch(db); opCount = 0; }
    }

    if (opCount > 0) {
        await batch.commit();
    }

    console.log("Seeding complete.");
  }
};
