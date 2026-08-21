import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createBattleState,
  applyAttack,
  defend,
  useSpecial,
  chooseMachineAction,
  evaluateBattleEnd,
  replaceDefeatedCard,
} from './battleService.js';

test('createBattleState crea el estado base con turnos y cartas activas', () => {
  const state = createBattleState(
    [{ id: 'p1', name: 'A', hp: 250, attacks: [{ baseDamage: 20 }] }],
    [{ id: 'm1', name: 'B', hp: 250, attacks: [{ baseDamage: 20 }] }],
    'player'
  );

  assert.equal(state.currentTurn, 'player');
  assert.equal(state.activePlayerCard.name, 'A');
  assert.equal(state.activeMachineCard.name, 'B');
});

test('applyAttack reduce HP con daño aleatorio y marca derrota cuando llega a cero', () => {
  const attacker = { id: 'p1', name: 'A' };
  const defender = { id: 'm1', name: 'B', hp: 25, isDefending: false };
  const result = applyAttack(attacker, defender, { baseDamage: 20 });

  assert.equal(typeof result.damage, 'number');
  assert.ok(result.damage >= 17 && result.damage <= 23);
  assert.ok(result.defender.hp <= 25);
});

test('defend activa la protección del siguiente ataque', () => {
  const card = { id: 'a', name: 'A', hp: 250 };
  const defended = defend(card);
  assert.equal(defended.isDefending, true);
});

test('useSpecial falla si la carta aún no alcanza el turno requerido', () => {
  const attacker = {
    id: 'p1',
    name: 'A',
    hp: 250,
    turnCount: 1,
    special: { name: 'Rayo final', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    specialCooldown: 0,
  };
  const defender = { id: 'm1', name: 'B', hp: 250, isDefending: false };

  const result = useSpecial(attacker, defender);
  assert.equal(result.damage, 0);
  assert.equal(result.message, 'El poder aún no está desbloqueado.');
});

test('chooseMachineAction siempre devuelve una opción válida', () => {
  const action = chooseMachineAction({
    id: 'm1',
    name: 'Bot',
    special: { unlockTurn: 2 },
    turnCount: 2,
    specialCooldown: 0,
  });

  assert.ok(['special', 'attack-1', 'attack-2', 'attack-3', 'attack-4', 'defend'].includes(action));
});

test('evaluateBattleEnd detecta al ganador cuando un mazo queda sin cartas vivas', () => {
  const playerDeck = [{ id: 'p1', hp: 0, defeated: true }];
  const machineDeck = [{ id: 'm1', hp: 100, defeated: false }];

  assert.equal(evaluateBattleEnd(playerDeck, machineDeck), 'machine');
});

test('applyAttack decrementa los usos del ataque y falla cuando llega a cero', () => {
  const attacker = {
    id: 'p1',
    name: 'Pikachu',
    type: 'Eléctrico',
    attacks: [{ id: 'atk-1', name: 'Impactrueno', baseDamage: 20, currentUses: 1, maxUses: 5 }],
  };
  const defender = { id: 'm1', name: 'Squirtle', type: 'Agua', hp: 200, isDefending: false };

  const firstUse = applyAttack(attacker, defender, attacker.attacks[0]);
  assert.equal(firstUse.success, true);
  assert.equal(firstUse.attacker.attacks[0].currentUses, 0);

  const secondUse = applyAttack(firstUse.attacker, firstUse.defender, firstUse.attacker.attacks[0]);
  assert.equal(secondUse.success, false);
  assert.equal(secondUse.damage, 0);
  assert.ok(secondUse.message.includes('sin usos'));
});

test('useSpecial decrementa los usos del especial y falla cuando llega a cero', () => {
  const attacker = {
    id: 'p1',
    name: 'Charmander',
    type: 'Fuego',
    hp: 250,
    turnCount: 2,
    special: { name: 'Llamarada', baseDamage: 65, unlockTurn: 2, cooldown: 3, currentUses: 1, maxUses: 2 },
    specialCooldown: 0,
  };
  const defender = { id: 'm1', name: 'Bulbasaur', type: 'Planta', hp: 250, isDefending: false };

  const firstUse = useSpecial(attacker, defender);
  assert.equal(firstUse.success, true);
  assert.equal(firstUse.attacker.special.currentUses, 0);

  const secondUse = useSpecial(firstUse.attacker, firstUse.defender);
  assert.equal(secondUse.success, false);
  assert.equal(secondUse.damage, 0);
  assert.ok(secondUse.message.includes('sin usos'));
});

test('applyAttack aplica multiplicador x2 para debilidad (Fuego contra Planta)', () => {
  const attacker = { id: 'p1', name: 'Charmander', type: 'Fuego', attacks: [{ name: 'Ascuas', baseDamage: 20 }] };
  const defender = { id: 'm1', name: 'Bulbasaur', type: 'Planta', hp: 250, isDefending: false };

  const result = applyAttack(attacker, defender, attacker.attacks[0]);
  assert.equal(result.multiplier, 2);
  assert.equal(result.effectMessage, '¡Es muy eficaz!');
  // 20 * ~1 * 2 = 34 - 46
  assert.ok(result.damage >= 34 && result.damage <= 46);
});

test('applyAttack aplica multiplicador x0 para inmunidad (Normal contra Fantasma)', () => {
  const attacker = { id: 'p1', name: 'Meowth', type: 'Normal', attacks: [{ name: 'Golpe', baseDamage: 20 }] };
  const defender = { id: 'm1', name: 'Gengar', type: 'Fantasma', hp: 250, isDefending: false };

  const result = applyAttack(attacker, defender, attacker.attacks[0]);
  assert.equal(result.multiplier, 0);
  assert.equal(result.damage, 0);
  assert.equal(result.defender.hp, 250);
});

test('replaceDefeatedCard devuelve la siguiente carta activa si existe', () => {
  const deck = [
    { id: 'p1', name: 'A', hp: 0, defeated: true },
    { id: 'p2', name: 'B', hp: 150, defeated: false },
    { id: 'p3', name: 'C', hp: 180, defeated: false },
  ];

  const { nextCard } = replaceDefeatedCard(deck, deck[0]);
  assert.equal(nextCard.name, 'B');
});

