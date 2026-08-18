import test from 'node:test';
import assert from 'node:assert/strict';

import { validateAndBuildDeck, generateMachineDeck, startCombat } from './gameFlowService.js';

test('validateAndBuildDeck acepta un mazo de 5 cartas válidas', () => {
  const deck = [
    { id: 'card-001' },
    { id: 'card-002' },
    { id: 'card-003' },
    { id: 'card-004' },
    { id: 'card-005' }
  ];

  const result = validateAndBuildDeck(deck);
  assert.equal(result.success, true);
  assert.deepEqual(result.deck, deck);
});

test('validateAndBuildDeck rechaza mazos inválidos', () => {
  const result = validateAndBuildDeck([{ id: 'card-001' }, { id: 'card-002' }]);
  assert.equal(result.success, false);
  assert.equal(result.message, 'Debes elegir exactamente 5 cartas.');
});

test('generateMachineDeck crea 5 cartas diferentes del mazo del jugador', () => {
  const allCards = [
    { id: 'card-001' },
    { id: 'card-002' },
    { id: 'card-003' },
    { id: 'card-004' },
    { id: 'card-005' },
    { id: 'card-006' },
    { id: 'card-007' },
    { id: 'card-008' },
    { id: 'card-009' },
    { id: 'card-010' }
  ];

  const playerDeck = [allCards[0], allCards[1], allCards[2], allCards[3], allCards[4]];
  const machineDeck = generateMachineDeck(playerDeck, allCards);

  assert.equal(machineDeck.length, 5);
  machineDeck.forEach((card) => {
    assert.equal(playerDeck.some((selected) => selected.id === card.id), false);
  });
});

test('startCombat inicia una partida con turno válido', () => {
  const result = startCombat(
    [{ id: 'card-001', name: 'A', hp: 250 }],
    [{ id: 'card-006', name: 'B', hp: 250 }]
  );

  assert.equal(result.success, true);
  assert.ok(['player', 'machine'].includes(result.battle.currentTurn));
});
