import test from 'node:test';
import assert from 'node:assert/strict';

import { initializeGameSession, validateSelectedDeck, createCombatSession, performPlayerAction, performMachineAction, checkBattleWinner } from './gameController.js';

globalThis.fetch = async (url) => {
  if (String(url).includes('/cards')) {
    return {
      ok: true,
      json: async () => [
        { id: 'card-001', name: 'A', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-002', name: 'B', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-003', name: 'C', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-004', name: 'D', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-005', name: 'E', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-006', name: 'F', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-007', name: 'G', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-008', name: 'H', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-009', name: 'I', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
        { id: 'card-010', name: 'J', hp: 250, active: true, attacks: [{ name: 'Attack', baseDamage: 20 }] },
      ],
    };
  }

  return {
    ok: true,
    json: async () => [],
  };
};

test('initializeGameSession carga cartas activas', async () => {
  const result = await initializeGameSession();
  assert.equal(result.success, true);
  assert.equal(result.cards.length, 10);
});

test('validateSelectedDeck rechaza mazos inválidos', () => {
  const result = validateSelectedDeck([{ id: 'card-001' }, { id: 'card-002' }]);
  assert.equal(result.valid, false);
});

test('createCombatSession crea un estado de batalla con turno válido', () => {
  const session = createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  );

  assert.equal(session.success, true);
  assert.ok(['player', 'machine'].includes(session.starter));
});

test('performPlayerAction usa defensa correctamente', () => {
  const session = createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  );

  session.state.currentTurn = 'player';
  const result = performPlayerAction(session.state, 'defend');
  assert.equal(result.success, true);
  assert.equal(result.state.activePlayerCard.isDefending, true);
});

test('performMachineAction ejecuta una acción válida', () => {
  const state = createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  ).state;

  state.currentTurn = 'machine';
  const result = performMachineAction(state);
  assert.equal(result.success, true);
});

test('checkBattleWinner devuelve null cuando aún hay cartas vivas', () => {
  const state = createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  ).state;

  assert.equal(checkBattleWinner(state), null);
});
