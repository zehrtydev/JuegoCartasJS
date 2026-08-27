import { getTypeMultiplier, getTypeEffectivenessMessage } from '../utils/typeEffectiveness.js';

export const MAX_ATTACK_USES = 5;
export const MAX_SPECIAL_USES = 2;
export const DODGE_CHANCE = 0.08;
export const CRITICAL_CHANCE = 0.12;
export const CRITICAL_MULTIPLIER = 1.5;

function initializeCardForBattle(card) {
  if (!card) return null;

  const attacks = Array.isArray(card.attacks) && card.attacks.length > 0
    ? card.attacks.map((atk, idx) => ({
        ...atk,
        id: atk.id || `attack-0${idx + 1}`,
        name: atk.name || `Ataque ${idx + 1}`,
        baseDamage: atk.baseDamage ?? 25,
        type: atk.type || card.type || 'Normal',
        maxUses: atk.maxUses ?? MAX_ATTACK_USES,
        currentUses: atk.currentUses ?? atk.maxUses ?? MAX_ATTACK_USES,
      }))
    : [
        {
          id: 'attack-01',
          name: 'Ataque básico',
          baseDamage: 25,
          type: card.type || 'Normal',
          maxUses: MAX_ATTACK_USES,
          currentUses: MAX_ATTACK_USES,
        },
      ];

  const special = card.special
    ? {
        ...card.special,
        name: card.special.name || 'Poder Especial',
        baseDamage: card.special.baseDamage ?? 65,
        type: card.special.type || card.type || 'Normal',
        unlockTurn: card.special.unlockTurn ?? 2,
        cooldown: card.special.cooldown ?? 3,
        maxUses: card.special.maxUses ?? MAX_SPECIAL_USES,
        currentUses: card.special.currentUses ?? card.special.maxUses ?? MAX_SPECIAL_USES,
      }
    : {
        name: 'Poder Especial',
        baseDamage: 65,
        type: card.type || 'Normal',
        unlockTurn: 2,
        cooldown: 3,
        maxUses: MAX_SPECIAL_USES,
        currentUses: MAX_SPECIAL_USES,
      };

  return {
    ...card,
    type: card.type || 'Normal',
    hp: card.hp ?? 250,
    defeated: false,
    isDefending: false,
    specialCooldown: 0,
    turnCount: 0,
    attacks,
    special,
  };
}

export function createBattleState(playerDeck = [], machineDeck = [], starter = 'player') {
  const finalPlayerDeck = playerDeck.map(initializeCardForBattle);
  const finalMachineDeck = machineDeck.map(initializeCardForBattle);

  const state = {
    playerDeck: finalPlayerDeck,
    machineDeck: finalMachineDeck,
    currentTurn: starter,
    activePlayerCard: finalPlayerDeck[0] ? { ...finalPlayerDeck[0] } : null,
    activeMachineCard: finalMachineDeck[0] ? { ...finalMachineDeck[0] } : null,
    winner: null,
    log: [],
    battleFinished: false,
  };

  // The starting card begins its first active turn (turnCount = 1)
  if (starter === 'player' && state.activePlayerCard) {
    state.activePlayerCard.turnCount = 1;
    state.playerDeck[0].turnCount = 1;
  } else if (starter === 'machine' && state.activeMachineCard) {
    state.activeMachineCard.turnCount = 1;
    state.machineDeck[0].turnCount = 1;
  }

  return state;
}

export function getCardById(deck, cardId) {
  return deck.find((card) => card.id === cardId) || null;
}

export function getNextActiveCard(deck, currentCardId = null) {
  const available = deck.filter((card) => !card.defeated && (card.hp ?? 0) > 0 && card.id !== currentCardId);
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

function resolveDamage(attacker, defender, move) {
  const attackType = move.type || attacker.type || 'Normal';
  const defenderType = defender.type || 'Normal';
  const multiplier = getTypeMultiplier(attackType, defenderType);
  const randomFactor = 0.85 + Math.random() * 0.3;
  const typeDamage = move.baseDamage * randomFactor * multiplier;
  const dodged = Math.random() < DODGE_CHANCE;

  if (dodged) {
    return {
      damage: 0,
      defender: { ...defender },
      finished: false,
      isCritical: false,
      dodged: true,
      multiplier,
      effectMessage: getTypeEffectivenessMessage(multiplier),
      message: '¡ATAQUE ESQUIVADO!',
    };
  }

  const isCritical = Math.random() < CRITICAL_CHANCE;
  const criticalDamage = isCritical ? typeDamage * CRITICAL_MULTIPLIER : typeDamage;
  const defendedDamage = defender.isDefending ? criticalDamage * 0.5 : criticalDamage;
  const damage = Math.round(defendedDamage);
  const nextHp = Math.max(0, (defender.hp ?? 250) - damage);
  const finished = nextHp <= 0;

  return {
    damage,
    defender: { ...defender, hp: nextHp, defeated: finished, isDefending: false },
    finished,
    isCritical,
    dodged: false,
    multiplier,
    effectMessage: getTypeEffectivenessMessage(multiplier),
    message: isCritical ? '¡GOLPE CRÍTICO!' : '',
  };
}

export function applyAttack(attacker, defender, attack) {
  if (!attacker || !defender || !attack) {
    return { damage: 0, defender, attacker, finished: false, message: 'Acción inválida.', success: false };
  }

  const currentUses = attack.currentUses ?? MAX_ATTACK_USES;
  if (currentUses <= 0) {
    return {
      damage: 0,
      defender,
      attacker,
      finished: false,
      message: `¡${attack.name} se ha quedado sin usos!`,
      success: false,
    };
  }

  // Decrementar usos del ataque en el atacante
  const updatedAttacks = (attacker.attacks || []).map((a) => {
    if (a.name === attack.name || a.id === attack.id) {
      return { ...a, currentUses: Math.max(0, currentUses - 1) };
    }
    return { ...a };
  });

  const resolution = resolveDamage(attacker, defender, attack);
  const eventMessage = resolution.message ? `${resolution.message} ` : '';
  const effectMessage = resolution.effectMessage ? `${resolution.effectMessage} ` : '';
  const message = resolution.finished
    ? `${eventMessage}${defender.name} fue derrotado.`
    : `${eventMessage}${effectMessage}${defender.name} recibió ${resolution.damage} de daño.`;

  return {
    ...resolution,
    attacker: { ...attacker, attacks: updatedAttacks },
    message,
    success: true,
  };
}

export function defend(card) {
  if (!card) return null;
  const defended = { ...card, isDefending: true };
  return defended;
}

export function useSpecial(attacker, defender) {
  if (!attacker || !defender || !attacker.special) {
    return { damage: 0, defender, attacker, finished: false, message: 'No se puede usar el poder.', success: false };
  }

  const special = attacker.special;
  const currentUses = special.currentUses ?? MAX_SPECIAL_USES;
  if (currentUses <= 0) {
    return { damage: 0, defender, attacker, finished: false, message: 'El poder especial se ha quedado sin usos.', success: false };
  }

  if ((attacker.turnCount ?? 0) < (special.unlockTurn ?? 2)) {
    return { damage: 0, defender, attacker, finished: false, message: 'El poder aún no está desbloqueado.', success: false };
  }

  if ((attacker.specialCooldown ?? 0) > 0) {
    return { damage: 0, defender, attacker, finished: false, message: 'El poder está en cooldown.', success: false };
  }

  const resolution = resolveDamage(attacker, defender, special);
  const eventMessage = resolution.message ? `${resolution.message} ` : '';
  const effectMessage = resolution.effectMessage ? `${resolution.effectMessage} ` : '';
  const message = resolution.finished
    ? `${eventMessage}¡${special.name}! ${defender.name} fue derrotado.`
    : `${eventMessage}${special.name}: ${effectMessage}${defender.name} recibió ${resolution.damage} de daño.`;

  const updatedAttacker = {
    ...attacker,
    specialCooldown: special.cooldown ?? 3,
    special: {
      ...special,
      currentUses: Math.max(0, currentUses - 1),
    },
  };

  return {
    ...resolution,
    attacker: updatedAttacker,
    message,
    success: true,
  };
}

export function progressCardTurn(card) {
  if (!card) return null;
  return {
    ...card,
    turnCount: (card.turnCount ?? 0) + 1,
    specialCooldown: Math.max(0, (card.specialCooldown ?? 0) - 1),
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

export function getAvailableActions(card) {
  if (!card) return [];

  const actions = (card.attacks || [])
    .map((attack, index) => ((attack.currentUses ?? MAX_ATTACK_USES) > 0 ? `attack-${index + 1}` : null))
    .filter(Boolean);

  actions.push('defend');

  const specialUses = card.special?.currentUses ?? MAX_SPECIAL_USES;
  const specialUnlocked = (card.turnCount ?? 0) >= (card.special?.unlockTurn ?? 2);
  if (specialUses > 0 && specialUnlocked && (card.specialCooldown ?? 0) === 0) {
    actions.push('special');
  }

  return actions;
}

export function chooseAutomaticAction(card, opponentCard) {
  const availableActions = getAvailableActions(card, opponentCard);
  if (availableActions.length === 0) return null;

  if (availableActions.includes('special') && (opponentCard?.hp ?? 0) > 100) {
    return 'special';
  }

  const hpPercent = (card.hp ?? 0) / 250;
  if (hpPercent <= 0.35 && Math.random() < 0.4) {
    return 'defend';
  }

  return availableActions.find((action) => action.startsWith('attack-')) || 'defend';
}

export function chooseMachineAction(machineCard, playerCard) {
  return chooseAutomaticAction(machineCard, playerCard);
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

  const nextCard = updated.find((card) => card.id !== currentCard.id && !card.defeated && (card.hp ?? 0) > 0);

  return {
    deck: updated,
    nextCard: nextCard ? { ...nextCard } : null,
  };
}


