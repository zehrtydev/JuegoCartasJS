import { normalizeDamage, getNextTurn, applyDefenseReduction } from '../utils/battleEngine.js';
import { getTypeMultiplier, getTypeEffectivenessMessage } from '../utils/typeEffectiveness.js';

export const MAX_ATTACK_USES = 5;
export const MAX_SPECIAL_USES = 2;

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

  const attackType = attack.type || attacker.type || 'Normal';
  const defenderType = defender.type || 'Normal';
  const multiplier = getTypeMultiplier(attackType, defenderType);

  const rawDamage = normalizeDamage(attack.baseDamage);
  const typeDamage = Math.round(rawDamage * multiplier);
  const reduced = defender.isDefending ? applyDefenseReduction(typeDamage, true) : typeDamage;
  const nextHp = Math.max(0, (defender.hp || 250) - reduced);
  const finished = nextHp <= 0;

  const effectMsg = getTypeEffectivenessMessage(multiplier);
  let message = finished ? `${defender.name} fue derrotado.` : `${defender.name} recibió ${reduced} de daño.`;
  if (multiplier === 0) {
    message = `¡No tuvo efecto contra ${defender.name}! (0 daño)`;
  } else if (effectMsg && !finished) {
    message = `${effectMsg} ${defender.name} recibió ${reduced} de daño.`;
  }

  return {
    damage: reduced,
    multiplier,
    effectMessage: effectMsg,
    defender: { ...defender, hp: nextHp, defeated: finished, isDefending: false },
    attacker: { ...attacker, attacks: updatedAttacks },
    finished,
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

  const attackType = special.type || attacker.type || 'Normal';
  const defenderType = defender.type || 'Normal';
  const multiplier = getTypeMultiplier(attackType, defenderType);

  const rawDamage = normalizeDamage(special.baseDamage);
  const typeDamage = Math.round(rawDamage * multiplier);
  const reduced = defender.isDefending ? applyDefenseReduction(typeDamage, true) : typeDamage;
  const nextHp = Math.max(0, (defender.hp || 250) - reduced);
  const finished = nextHp <= 0;

  const effectMsg = getTypeEffectivenessMessage(multiplier);
  let message = `Poder especial usado: ${special.name}.`;
  if (multiplier === 0) {
    message = `¡${special.name} no tuvo efecto contra ${defender.name}! (0 daño)`;
  } else if (effectMsg) {
    message = `${special.name}: ${effectMsg} ${defender.name} recibió ${reduced} de daño.`;
  }
  if (finished) {
    message = `¡${special.name}! ${defender.name} fue derrotado.`;
  }

  const updatedAttacker = {
    ...attacker,
    specialCooldown: special.cooldown ?? 3,
    special: {
      ...special,
      currentUses: Math.max(0, currentUses - 1),
    },
  };

  const updatedDefender = {
    ...defender,
    hp: nextHp,
    defeated: finished,
    isDefending: false,
  };

  return {
    damage: reduced,
    multiplier,
    effectMessage: effectMsg,
    defender: updatedDefender,
    attacker: updatedAttacker,
    finished,
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

export function chooseMachineAction(machineCard) {
  if (!machineCard) return null;

  const available = [];

  // Especial solo si tiene usos > 0, no está en cooldown y cumple turnCount
  const specialUses = machineCard.special?.currentUses ?? MAX_SPECIAL_USES;
  if (
    specialUses > 0 &&
    (machineCard.specialCooldown ?? 0) <= 0 &&
    (machineCard.turnCount ?? 0) >= (machineCard.special?.unlockTurn ?? 2)
  ) {
    available.push('special');
  }

  // Ataques con usos > 0
  const attacks = machineCard.attacks || [];
  attacks.forEach((attack, index) => {
    const uses = attack.currentUses ?? MAX_ATTACK_USES;
    if (uses > 0) {
      available.push(`attack-${index + 1}`);
    }
  });

  // Defensa siempre disponible
  available.push('defend');

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

  const nextCard = updated.find((card) => card.id !== currentCard.id && !card.defeated && (card.hp ?? 0) > 0);

  return {
    deck: updated,
    nextCard: nextCard ? { ...nextCard } : null,
  };
}


