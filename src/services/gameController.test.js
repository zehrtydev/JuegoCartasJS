import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  initializeGameSession,
  validateSelectedDeck,
  createCombatSession,
  performPlayerAction,
  performMachineAction,
  checkBattleWinner,
  FIXED_POOL_CARDS,
  selectFixedPool,
} from './gameController.js';

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

test('initializeGameSession filtra las cartas activas según el pool fijo', async () => {
  const result = await initializeGameSession();
  assert.equal(result.success, true);
  assert.deepEqual(result.cards.map((card) => card.id), [
    'card-001',
    'card-004',
    'card-006',
    'card-007',
    'card-009',
  ]);
});

test('selectFixedPool carga las 20 cartas fijas con sus imágenes locales', () => {
  const catalog = Array.from({ length: 151 }, (_, index) => ({ id: `card-${index + 1}` }));
  const normalizedCatalog = catalog.map((card, index) => ({
    ...card,
    id: `card-${String(index + 1).padStart(3, '0')}`,
  }));
  const pool = selectFixedPool(normalizedCatalog);

  assert.equal(pool.length, 20);
  assert.equal(FIXED_POOL_CARDS.length, 20);
  assert.equal(new Set(pool.map((card) => card.id)).size, 20);
  pool.forEach((card) => {
    assert.ok(normalizedCatalog.some((catalogCard) => catalogCard.id === card.id));
    assert.match(card.imageUrl, /^\/assets\/images\/cards\/.+\.png$/);
  });
});

test('validateSelectedDeck rechaza mazos inválidos', () => {
  const result = validateSelectedDeck([{ id: 'card-001' }, { id: 'card-002' }]);
  assert.equal(result.valid, false);
});

test('createCombatSession crea un estado de batalla con turno válido', async () => {
  const session = await createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  );

  assert.equal(session.success, true);
  assert.ok(['player', 'machine'].includes(session.starter));
});

test('performPlayerAction usa defensa correctamente', async () => {
  const session = await createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  );

  session.state.currentTurn = 'player';
  const result = performPlayerAction(session.state, 'defend');
  assert.equal(result.success, true);
  assert.equal(result.state.activePlayerCard.isDefending, true);
});

test('performMachineAction ejecuta una acción válida', async () => {
  const state = (await createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  )).state;

  state.currentTurn = 'machine';
  const result = performMachineAction(state);
  assert.equal(result.success, true);
});

test('checkBattleWinner devuelve null cuando aún hay cartas vivas', async () => {
  const state = (await createCombatSession(
    [{ id: 'card-001', name: 'A', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }],
    [{ id: 'card-006', name: 'B', hp: 250, attacks: [{ name: 'Attack', baseDamage: 20 }] }]
  )).state;

  assert.equal(checkBattleWinner(state), null);
});

// MANDATORY NEW TESTS

test('Catálogo de 151 cartas con imagen y cry', () => {
  const dbPath = path.resolve('src/data/db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  assert.equal(dbData.cards.length, 151);

  const firstCard = dbData.cards[0];
  assert.ok(firstCard.id, 'Falta el campo id');
  assert.ok(firstCard.number, 'Falta el campo number');
  assert.ok(firstCard.name, 'Falta el campo name');
  assert.ok(Array.isArray(firstCard.types), 'Falta el campo types');
  assert.ok(firstCard.imageUrl || firstCard.image, 'Falta el campo imageUrl/image');
  assert.ok(firstCard.cryUrl || firstCard.criesUrl || firstCard.sounds?.attack, 'Falta el campo cryUrl/criesUrl/cry');
  assert.equal(firstCard.hp, 250, 'El HP base debe ser 250');
  assert.equal(firstCard.attacks.length, 4, 'Debe haber exactamente 4 ataques');
  assert.ok(firstCard.defense, 'Falta la acción de defensa');
  assert.ok(firstCard.special, 'Falta la acción especial');
  assert.equal(firstCard.active, true, 'La carta debe estar activa');
});

test('Relevo del jugador tras KO', async () => {
  const playerDeck = [
    { id: 'card-001', name: 'Player A', hp: 10, attacks: [{ name: 'Scratch', baseDamage: 20 }] },
    { id: 'card-002', name: 'Player B', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];
  const machineDeck = [
    { id: 'card-006', name: 'Bot A', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];

  const session = await createCombatSession(playerDeck, machineDeck);
  const state = session.state;

  state.currentTurn = 'machine';
  // Force machine attack, which KOs Player A (10 HP) and triggers relevo to Player B
  const originalRandom = Math.random;
  Math.random = () => 0;
  const result = performMachineAction(state);
  Math.random = originalRandom;

  assert.equal(result.success, true);
  assert.equal(state.playerDeck[0].defeated, true);
  assert.equal(state.playerDeck[0].hp, 0);
  assert.equal(state.activePlayerCard.id, 'card-002');
  assert.equal(result.result.isKo, true);
  assert.equal(result.result.relevo, true);
  assert.equal(result.result.newActiveCard.id, 'card-002');
});

test('Relevo del bot tras KO', async () => {
  const playerDeck = [
    { id: 'card-001', name: 'Player A', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];
  const machineDeck = [
    { id: 'card-006', name: 'Bot A', hp: 10, attacks: [{ name: 'Scratch', baseDamage: 20 }] },
    { id: 'card-007', name: 'Bot B', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];

  const session = await createCombatSession(playerDeck, machineDeck);
  const state = session.state;

  state.currentTurn = 'player';
  // Force player attack, which KOs Bot A (10 HP) and triggers relevo to Bot B
  const result = performPlayerAction(state, 'attack', 0);

  assert.equal(result.success, true);
  assert.equal(state.machineDeck[0].defeated, true);
  assert.equal(state.machineDeck[0].hp, 0);
  assert.equal(state.activeMachineCard.id, 'card-007');
  assert.equal(result.result.isKo, true);
  assert.equal(result.result.relevo, true);
  assert.equal(result.result.newActiveCard.id, 'card-007');
});

test('Combate termina solo al derrotar las cinco cartas', async () => {
  const playerDeck = [
    { id: 'card-001', name: 'Player A', hp: 10, attacks: [{ name: 'Scratch', baseDamage: 20 }] },
    { id: 'card-002', name: 'Player B', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];
  const machineDeck = [
    { id: 'card-006', name: 'Bot A', hp: 10, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];

  const session = await createCombatSession(playerDeck, machineDeck);
  const state = session.state;

  state.currentTurn = 'player';
  const result1 = performPlayerAction(state, 'attack', 0);
  assert.equal(result1.success, true);
  assert.equal(state.battleFinished, true, 'El combate debe terminar cuando el bot no tiene más cartas');
  assert.equal(state.winner, 'player');

  const session2 = await createCombatSession(playerDeck, machineDeck);
  const state2 = session2.state;
  state2.currentTurn = 'machine';
  const result2 = performMachineAction(state2); // KOs Player A, but Player B is alive
  assert.equal(result2.success, true);
  assert.equal(state2.battleFinished, false, 'El combate no debe terminar si el jugador tiene cartas vivas');
  assert.equal(state2.winner, null);
});

test('Especial desde el segundo turno propio', async () => {
  const playerDeck = [
    {
      id: 'card-001',
      name: 'Player A',
      hp: 250,
      attacks: [{ name: 'Scratch', baseDamage: 20 }],
      special: { name: 'Super Beam', baseDamage: 65, unlockTurn: 2, cooldown: 3 }
    }
  ];
  const machineDeck = [
    { id: 'card-006', name: 'Bot A', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];

  const session = await createCombatSession(playerDeck, machineDeck);
  const state = session.state;

  state.currentTurn = 'player';
  state.activePlayerCard.turnCount = 1;
  state.activePlayerCard.specialCooldown = 0;
  state.activeMachineCard.turnCount = 0;
  state.activeMachineCard.specialCooldown = 0;
  state.playerDeck[0].turnCount = 1;
  state.playerDeck[0].specialCooldown = 0;
  state.machineDeck[0].turnCount = 0;
  state.machineDeck[0].specialCooldown = 0;

  assert.equal(state.activePlayerCard.turnCount, 1);

  // Try using special in turn 1 -> fails
  const result1 = performPlayerAction(state, 'special');
  assert.equal(result1.success, false);
  assert.equal(result1.message, 'El poder aún no está desbloqueado.');

  // Attack normally instead
  const resultAttack = performPlayerAction(state, 'attack', 0);
  assert.equal(resultAttack.success, true);

  // Bot Turn
  const resultBot = performMachineAction(state);
  assert.equal(resultBot.success, true);

  // Player starts its 2nd turn
  assert.equal(state.currentTurn, 'player');
  assert.equal(state.activePlayerCard.turnCount, 2);

  // Try special now -> succeeds
  const resultSpecial = performPlayerAction(state, 'special');
  assert.equal(resultSpecial.success, true);
});

test('Cooldown del especial', async () => {
  const playerDeck = [
    {
      id: 'card-001',
      name: 'Player A',
      hp: 250,
      attacks: [{ name: 'Scratch', baseDamage: 20 }],
      special: { name: 'Super Beam', baseDamage: 65, unlockTurn: 2, cooldown: 3 }
    }
  ];
  const machineDeck = [
    { id: 'card-006', name: 'Bot A', hp: 250, attacks: [{ name: 'Scratch', baseDamage: 20 }] }
  ];

  const session = await createCombatSession(playerDeck, machineDeck);
  const state = session.state;

  state.currentTurn = 'player';
  state.activePlayerCard.turnCount = 1;
  state.activePlayerCard.specialCooldown = 0;
  state.activeMachineCard.turnCount = 0;
  state.activeMachineCard.specialCooldown = 0;
  state.playerDeck[0].turnCount = 1;
  state.playerDeck[0].specialCooldown = 0;
  state.machineDeck[0].turnCount = 0;
  state.machineDeck[0].specialCooldown = 0;

  performPlayerAction(state, 'attack', 0);

  // Bot Turn
  performMachineAction(state);

  // 2nd turn - Use Special
  const specRes = performPlayerAction(state, 'special');
  assert.equal(specRes.success, true);
  assert.equal(state.activePlayerCard.specialCooldown, 3);

  // Bot Turn
  performMachineAction(state);

  // 3rd turn - cooldown decreases to 2
  assert.equal(state.currentTurn, 'player');
  assert.equal(state.activePlayerCard.specialCooldown, 2);

  const failSpec1 = performPlayerAction(state, 'special');
  assert.equal(failSpec1.success, false);
  assert.equal(failSpec1.message, 'El poder está en cooldown.');

  performPlayerAction(state, 'attack', 0);

  // Bot Turn
  performMachineAction(state);

  // 4th turn - cooldown decreases to 1
  assert.equal(state.activePlayerCard.specialCooldown, 1);
  performPlayerAction(state, 'attack', 0);

  // Bot Turn
  performMachineAction(state);

  // 5th turn - cooldown decreases to 0 (available!)
  assert.equal(state.activePlayerCard.specialCooldown, 0);

  const successSpec = performPlayerAction(state, 'special');
  assert.equal(successSpec.success, true);
});

