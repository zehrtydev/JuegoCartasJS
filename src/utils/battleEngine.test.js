import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeDamage,
  getRandomStarter,
  canUseSpecial,
  getNextTurn,
  applyDefenseReduction,
  createEmptyBattleState,
} from './battleEngine.js';

test('normalizeDamage devuelve un valor entero dentro del rango esperado', () => {
  const value = normalizeDamage(50);
  assert.equal(typeof value, 'number');
  assert.ok(Number.isInteger(value));
  assert.ok(value >= 43 && value <= 58);
});

test('getRandomStarter devuelve solo player o machine', () => {
  const value = getRandomStarter();
  assert.ok(value === 'player' || value === 'machine');
});

test('canUseSpecial solo se habilita según el turno', () => {
  const card = {
    special: {
      unlockTurn: 2,
      cooldown: 3,
    },
  };

  assert.equal(canUseSpecial(card, 1), false);
  assert.equal(canUseSpecial(card, 2), true);
});

test('getNextTurn alterna correctamente', () => {
  assert.equal(getNextTurn('player'), 'machine');
  assert.equal(getNextTurn('machine'), 'player');
});

test('applyDefenseReduction reduce a la mitad el daño', () => {
  assert.equal(applyDefenseReduction(100, true), 50);
  assert.equal(applyDefenseReduction(100, false), 100);
});

test('createEmptyBattleState inicializa el estado base', () => {
  const state = createEmptyBattleState();
  assert.deepEqual(state.playerDeck, []);
  assert.deepEqual(state.machineDeck, []);
  assert.equal(state.currentTurn, 'player');
  assert.equal(state.battleFinished, false);
  assert.equal(state.winner, null);
});
