import { normalizeDamage, getNextTurn, applyDefenseReduction } from '../utils/battleEngine.js';

export function createBattleState(playerDeck = [], machineDeck = [], starter = 'player') {
  return {
    playerDeck: playerDeck.map((card) => ({ ...card, hp: card.hp ?? 250, defeated: false, isDefending: false, specialCooldown: 0, turnCount: 0 })),
    machineDeck: machineDeck.map((card) => ({ ...card, hp: card.hp ?? 250, defeated: false, isDefending: false, specialCooldown: 0, turnCount: 0 })),
    currentTurn: starter,
    activePlayerCard: playerDeck[0] ? { ...playerDeck[0], hp: playerDeck[0].hp ?? 250, defeated: false, isDefending: false, specialCooldown: 0, turnCount: 0 } : null,
    activeMachineCard: machineDeck[0] ? { ...machineDeck[0], hp: machineDeck[0].hp ?? 250, defeated: false, isDefending: false, specialCooldown: 0, turnCount: 0 } : null,
    winner: null,
    log: [],
  };
}

export function getCardById(deck, cardId) {
  return deck.find((card) => card.id === cardId) || null;
}

export function getNextActiveCard(deck, currentCardId = null) {
  const available = deck.filter((card) => !card.defeated && card.id !== currentCardId);
  return available[0] || null;
}

export function prepareCardForTurn(card) {
  if (!card) return null;

  const prepared = { ...card };
  prepared.hp = prepared.hp ?? 250;
  prepared.turnCount = prepared.turnCount ?? 0;
  prepared.specialCooldown = prepared.specialCooldown ?? 0;
  prepared.isDefending = false;
  return prepared;
}

export function applyAttack(attacker, defender, attack) {
  if (!attacker || !defender || !attack) {
    return { damage: 0, defender, attacker, finished: false, message: 'Acción inválida.' };
  }

  const damage = normalizeDamage(attack.baseDamage);
  const reduced = defender.isDefending ? applyDefenseReduction(damage, true) : damage;
  const nextHp = Math.max(0, (defender.hp || 250) - reduced);
  defender.hp = nextHp;
  defender.isDefending = false;

  const finished = nextHp <= 0;

  return {
    damage: reduced,
    defender: { ...defender, hp: nextHp },
    attacker: { ...attacker },
    finished,
    message: finished ? `${defender.name} fue derrotada.` : `${defender.name} recibió ${reduced} de daño.`,
  };
}

export function defend(card) {
  if (!card) return null;
  const defended = { ...card, isDefending: true };
  return defended;
}

export function useSpecial(attacker, defender) {
  if (!attacker || !defender || !attacker.special) {
    return { damage: 0, defender, attacker, finished: false, message: 'No se puede usar el poder.' };
  }

  if ((attacker.turnCount ?? 0) < (attacker.special.unlockTurn ?? 2)) {
    return { damage: 0, defender, attacker, finished: false, message: 'El poder aún no está desbloqueado.' };
  }

  if ((attacker.specialCooldown ?? 0) > 0) {
    return { damage: 0, defender, attacker, finished: false, message: 'El poder está en cooldown.' };
  }

  const damage = normalizeDamage(attacker.special.baseDamage);
  const reduced = defender.isDefending ? applyDefenseReduction(damage, true) : damage;
  const nextHp = Math.max(0, (defender.hp || 250) - reduced);

  defender.hp = nextHp;
  defender.isDefending = false;
  attacker.specialCooldown = attacker.special.cooldown ?? 3;
  attacker.turnCount = (attacker.turnCount ?? 0) + 1;

  return {
    damage: reduced,
    defender: { ...defender, hp: nextHp },
    attacker: { ...attacker, specialCooldown: attacker.specialCooldown },
    finished: nextHp <= 0,
    message: `Poder especial usado: ${attacker.special.name}.`,
  };
}

export function reduceCooldowns(deck) {
  return deck.map((card) => {
    if (!card) return card;
    const cooldown = Math.max(0, (card.specialCooldown ?? 0) - 1);
    return {
      ...card,
      specialCooldown: cooldown,
      turnCount: (card.turnCount ?? 0) + 1,
    };
  });
}

export function chooseMachineAction(machineCard) {
  if (!machineCard) return null;

  const available = [];

  if ((machineCard.specialCooldown ?? 0) <= 0 && (machineCard.turnCount ?? 0) >= (machineCard.special?.unlockTurn ?? 2)) {
    available.push('special');
  }

  available.push('attack-1', 'attack-2', 'attack-3', 'attack-4', 'defend');

  return available[Math.floor(Math.random() * available.length)];
}

export function evaluateBattleEnd(playerDeck, machineDeck) {
  const playerAlive = playerDeck.some((card) => !card.defeated && (card.hp ?? 0) > 0);
  const machineAlive = machineDeck.some((card) => !card.defeated && (card.hp ?? 0) > 0);

  if (!playerAlive) return 'machine';
  if (!machineAlive) return 'player';
  return null;
}

export function replaceDefeatedCard(deck, currentCard) {
  if (!deck || !currentCard) return deck;

  const updated = deck.map((card) =>
    card.id === currentCard.id ? { ...card, defeated: true, hp: 0 } : card
  );

  const nextCard = updated.find((card) => card.id !== currentCard.id && !card.defeated);

  return {
    deck: updated,
    nextCard,
  };
}
