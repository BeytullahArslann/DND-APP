export const getModifier = (score) => Math.floor((score - 10) / 2);

export const formatModifier = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

export const getProficiencyBonus = (level) => Math.ceil(level / 4) + 1;

export const calculateCasterLevel = (classes) => {
  let total = 0;
  classes.forEach((c) => {
    if (['Ozan', 'Ruhban', 'Druid', 'Sihirbaz (Sorcerer)', 'Büyücü (Wizard)'].includes(c.name)) {
      total += c.level;
    } else if (['Paladin', 'Koruyucu'].includes(c.name)) {
      total += Math.floor(c.level / 2);
    } else if (['Savaşçı', 'Hırsız'].includes(c.name)) {
      total += Math.floor(c.level / 3);
    }
  });
  return Math.max(0, total);
};

export const parseDamage = (damageStr) => {
  if (!damageStr) return { diceCount: 0, diceSides: 0, bonus: 0 };
  const regex = /(\d+)d(\d+)([+-]\d+)?/;
  const match = damageStr.match(regex);
  if (!match) return { diceCount: 0, diceSides: 0, bonus: 0 };
  return {
    diceCount: parseInt(match[1]),
    diceSides: parseInt(match[2]),
    bonus: match[3] ? parseInt(match[3]) : 0,
  };
};
