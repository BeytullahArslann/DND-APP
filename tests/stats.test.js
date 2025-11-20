import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCasterLevel, formatModifier, getModifier, getProficiencyBonus, parseDamage } from '../src/utils/stats.js';

describe('stat helpers', () => {
  test('calculates ability modifiers', () => {
    assert.equal(getModifier(10), 0);
    assert.equal(getModifier(9), -1);
    assert.equal(getModifier(18), 4);
  });

  test('formats modifiers with sign', () => {
    assert.equal(formatModifier(3), '+3');
    assert.equal(formatModifier(-2), '-2');
  });

  test('derives proficiency bonus from level', () => {
    assert.equal(getProficiencyBonus(1), 2);
    assert.equal(getProficiencyBonus(5), 3);
    assert.equal(getProficiencyBonus(17), 6);
  });

  test('calculates caster levels across mixed classes', () => {
    const classes = [
      { name: 'Ozan', level: 3 },
      { name: 'Paladin', level: 4 },
      { name: 'Savaşçı', level: 3 },
    ];

    assert.equal(calculateCasterLevel(classes), 6);
  });

  test('parses damage strings safely', () => {
    assert.deepEqual(parseDamage('2d6+3'), { diceCount: 2, diceSides: 6, bonus: 3 });
    assert.deepEqual(parseDamage('5d8-2'), { diceCount: 5, diceSides: 8, bonus: -2 });
    assert.deepEqual(parseDamage('invalid'), { diceCount: 0, diceSides: 0, bonus: 0 });
    assert.deepEqual(parseDamage(undefined), { diceCount: 0, diceSides: 0, bonus: 0 });
  });
});
