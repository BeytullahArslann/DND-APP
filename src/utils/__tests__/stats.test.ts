import { describe, it, expect } from 'vitest';
import { calculateCasterLevel, formatModifier, getModifier, getProficiencyBonus, parseDamage } from '../stats';

describe('stat helpers', () => {
  it('calculates ability modifiers', () => {
    expect(getModifier(10)).toBe(0);
    expect(getModifier(9)).toBe(-1);
    expect(getModifier(18)).toBe(4);
  });

  it('formats modifiers with sign', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(-2)).toBe('-2');
  });

  it('derives proficiency bonus from level', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(17)).toBe(6);
  });

  it('calculates caster levels across mixed classes', () => {
    const classes = [
      { name: 'Ozan', level: 3 },
      { name: 'Paladin', level: 4 },
      { name: 'Savaşçı', level: 3 },
    ];

    expect(calculateCasterLevel(classes)).toBe(6);
  });

  it('parses damage strings safely', () => {
    expect(parseDamage('2d6+3')).toEqual({ diceCount: 2, diceSides: 6, bonus: 3 });
    expect(parseDamage('5d8-2')).toEqual({ diceCount: 5, diceSides: 8, bonus: -2 });
    expect(parseDamage('invalid')).toEqual({ diceCount: 0, diceSides: 0, bonus: 0 });
    expect(parseDamage(undefined as any)).toEqual({ diceCount: 0, diceSides: 0, bonus: 0 });
  });
});
