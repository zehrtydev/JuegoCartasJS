/**
 * José: lógica de juego + dominio + servicio de sesión.
 * Manuel: componente visual / UX.
 *
 * Este archivo actúa como interfaz de alto nivel para la UI, pero
 * centraliza la lógica real en los servicios del dominio.
 */
import {
  loadActiveCards,
  registerAndStartPlayer,
  validateAndBuildDeck,
  startCombat,
  finishBattle,
} from './gameFlowService.js';
import { validateDeckSelection, buildMachineDeck } from './deckService.js';
import {
  createBattleState,
  applyAttack,
  defend,
  useSpecial,
  chooseMachineAction,
  chooseAutomaticAction,
  getAvailableActions,
  hasMutualImmunityLock,
  evaluateBattleEnd,
  replaceDefeatedCard,
  progressCardTurn,
} from './battleService.js';

function buildAttackLog(actorLabel, moveName, result) {
  const eventMessage = result.immunityBreak
    ? '¡FORCEJEO AUTOMÁTICO CONTRA INMUNIDAD! '
    : result.dodged
    ? '¡ATAQUE ESQUIVADO! '
    : (result.isCritical ? '¡GOLPE CRÍTICO! ' : '');
  const effectMessage = result.effectMessage ? `(${result.effectMessage}) ` : '';
  return `${eventMessage}${actorLabel} usa ${moveName} ${effectMessage}e inflige ${result.damage} daño.`;
}

function enrichActionResult(result, outcome) {
  return {
    damage: result.damage,
    multiplier: result.multiplier,
    effectMessage: result.effectMessage,
    isCritical: result.isCritical === true,
    dodged: result.dodged === true,
    immunityBreak: result.immunityBreak === true,
    message: result.message,
    isKo: outcome.isKo,
    relevo: outcome.relevo,
    newActiveCard: outcome.newActiveCard,
  };
}

/**
 * Catálogo fijo de la experiencia de juego. Cada carta tiene un recurso visual
 * local en public/assets/images/cards, para no depender de una selección al azar.
 */
export const FIXED_POOL_CARDS = [
  ['card-001', 'bulbasaur.png'],
  ['card-004', 'charmander.png'],
  ['card-006', 'charizard.png'],
  ['card-007', 'squirtle.png'],
  ['card-009', 'blastoise.png'],
  ['card-025', 'pikachu.png'],
  ['card-026', 'raichu.png'],
  ['card-039', 'jigglypuff.png'],
  ['card-052', 'meowth.png'],
  ['card-054', 'psyduck.png'],
  ['card-059', 'arcanine.png'],
  ['card-094', 'gengar.png'],
  ['card-104', 'cubone.png'],
  ['card-130', 'gyarados.png'],
  ['card-131', 'lapras.png'],
  ['card-136', 'flareon.png'],
  ['card-143', 'snorlax.png'],
  ['card-149', 'dragonite.png'],
  ['card-150', 'mewtwo.png'],
  ['card-151', 'mew.png'],
];

export function selectFixedPool(cards) {
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  return FIXED_POOL_CARDS
    .map(([id, imageFile]) => {
      const card = cardsById.get(id);
      if (!card) return null;

      const localImageUrl = `/assets/images/cards/${imageFile}`;
      return { ...card, image: localImageUrl, imageUrl: localImageUrl };
    })
    .filter(Boolean);
}

export async function initializeGameSession() {
  const cards = selectFixedPool(await loadActiveCards());
  return {
    success: true,
    cards,
    minCardsRequired: 10,
  };
}

export async function registerPlayerSession(nickname) {
  return registerAndStartPlayer(nickname);
}

export function validateSelectedDeck(selectedCards) {
  return validateDeckSelection(selectedCards);
}

export async function createCombatSession(playerDeck, machineDeck = [], poolCards = []) {
  let finalMachineDeck = [...machineDeck];
  if (!finalMachineDeck || finalMachineDeck.length === 0) {
    const availablePool = poolCards.length > 0 ? poolCards : await loadActiveCards();
    if (availablePool.length < 10) {
      return {
        success: false,
        state: null,
        starter: null,
        message: 'Se necesitan al menos 10 cartas activas para iniciar la partida.',
      };
    }
    finalMachineDeck = buildMachineDeck(playerDeck, availablePool);
  }

  const { success, battle, message } = startCombat(playerDeck, finalMachineDeck);
  return {
    success,
    state: battle,
    starter: battle.currentTurn,
    message,
  };
}

function processActionOutcome(state, activeAttacker, activeDefender, result, isPlayerAttacking) {
  const attackerDeck = isPlayerAttacking ? state.playerDeck : state.machineDeck;
  const defenderDeck = isPlayerAttacking ? state.machineDeck : state.playerDeck;

  const attackerIdx = attackerDeck.findIndex(c => c.id === activeAttacker.id);
  if (attackerIdx !== -1) {
    attackerDeck[attackerIdx] = { ...result.attacker };
  }

  const defenderIdx = defenderDeck.findIndex(c => c.id === activeDefender.id);
  if (defenderIdx !== -1) {
    defenderDeck[defenderIdx] = { ...result.defender };
  }

  if (isPlayerAttacking) {
    state.activePlayerCard = { ...result.attacker };
    state.activeMachineCard = { ...result.defender };
  } else {
    state.activeMachineCard = { ...result.attacker };
    state.activePlayerCard = { ...result.defender };
  }

  let isKo = result.finished;
  let relevo = false;
  let newActiveCard = null;

  if (isKo) {
    const targetActiveCard = isPlayerAttacking ? state.activeMachineCard : state.activePlayerCard;
    targetActiveCard.defeated = true;
    targetActiveCard.hp = 0;

    const defDeck = isPlayerAttacking ? state.machineDeck : state.playerDeck;
    const defIdx = defDeck.findIndex(c => c.id === targetActiveCard.id);
    if (defIdx !== -1) {
      defDeck[defIdx].defeated = true;
      defDeck[defIdx].hp = 0;
    }

    state.log.push(`¡${targetActiveCard.name} fue derrotado!`);

    const replaceResult = replaceDefeatedCard(defDeck, targetActiveCard);
    
    if (replaceResult.nextCard) {
      if (isPlayerAttacking) {
        state.activeMachineCard = { ...replaceResult.nextCard };
      } else {
        state.activePlayerCard = { ...replaceResult.nextCard };
      }
      relevo = true;
      newActiveCard = replaceResult.nextCard;
      state.log.push(`¡${newActiveCard.name} entra a la arena!`);
    } else {
      state.battleFinished = true;
      state.winner = isPlayerAttacking ? 'player' : 'machine';
      state.log.push(`¡La batalla ha terminado! Ganador: ${state.winner === 'player' ? 'Jugador' : 'Máquina'}.`);
    }
  }

  if (!state.battleFinished) {
    state.currentTurn = isPlayerAttacking ? 'machine' : 'player';

    const nextActiveCard = isPlayerAttacking ? state.activeMachineCard : state.activePlayerCard;
    const nextDeck = isPlayerAttacking ? state.machineDeck : state.playerDeck;
    
    if (nextActiveCard) {
      const updatedNext = progressCardTurn(nextActiveCard);
      if (isPlayerAttacking) {
        state.activeMachineCard = updatedNext;
      } else {
        state.activePlayerCard = updatedNext;
      }
      const nextIdx = nextDeck.findIndex(c => c.id === nextActiveCard.id);
      if (nextIdx !== -1) {
        nextDeck[nextIdx] = { ...updatedNext };
      }
    }
  }

  return {
    isKo,
    relevo,
    newActiveCard
  };
}

export function performPlayerAction(state, action, attackId = null, options = {}) {
  const activePlayer = state.activePlayerCard;
  const activeMachine = state.activeMachineCard;

  if (!activePlayer || !activeMachine) {
    return { success: false, message: 'No hay cartas activas.' };
  }

  if (state.currentTurn !== 'player') {
    return { success: false, message: 'Es el turno de la máquina.' };
  }

  if (action === 'switch') {
    const newCardId = attackId;
    const newCard = state.playerDeck.find(c => c.id === newCardId);
    if (!newCard || newCard.defeated || newCard.id === activePlayer.id || (newCard.hp || 0) <= 0) {
      return { success: false, message: 'Carta inválida para cambio.' };
    }

    activePlayer.isDefending = false;
    const oldIdx = state.playerDeck.findIndex(c => c.id === activePlayer.id);
    if (oldIdx !== -1) {
      state.playerDeck[oldIdx] = { ...activePlayer };
    }

    newCard.isDefending = false;
    state.activePlayerCard = { ...newCard };
    
    state.log.push(`Jugador retira a ${activePlayer.name} y envía a ${newCard.name}.`);

    state.currentTurn = 'machine';
    if (state.activeMachineCard) {
      const updatedNext = progressCardTurn(state.activeMachineCard);
      state.activeMachineCard = updatedNext;
      const mIdx = state.machineDeck.findIndex(c => c.id === updatedNext.id);
      if (mIdx !== -1) {
        state.machineDeck[mIdx] = { ...updatedNext };
      }
    }

    return {
      success: true,
      result: {
        damage: 0,
        message: `Jugador retira a ${activePlayer.name} y envía a ${newCard.name}.`,
        isKo: false,
        relevo: true,
        newActiveCard: newCard
      },
      state
    };
  }

  if (action === 'attack') {
    const attack = activePlayer.attacks?.[attackId] || activePlayer.attacks?.[0];
    if (!attack) {
      return { success: false, message: 'No hay ataques disponibles.' };
    }
    const result = applyAttack(activePlayer, activeMachine, attack, options);
    if (!result.success && result.damage === 0) {
      return { success: false, message: result.message };
    }
    
    const outcome = processActionOutcome(state, activePlayer, activeMachine, result, true);

    const logEntry = buildAttackLog('Jugador', attack.name, result);
    state.log.push(logEntry);

    return {
      success: true,
      result: { ...enrichActionResult(result, outcome), message: logEntry },
      state
    };
  }

  if (action === 'defend') {
    const defended = defend(activePlayer);
    state.activePlayerCard = defended;
    
    const idx = state.playerDeck.findIndex(c => c.id === defended.id);
    if (idx !== -1) {
      state.playerDeck[idx] = { ...defended };
    }

    state.log.push('Jugador usa defensa.');

    state.currentTurn = 'machine';
    if (state.activeMachineCard) {
      const updatedNext = progressCardTurn(state.activeMachineCard);
      state.activeMachineCard = updatedNext;
      const mIdx = state.machineDeck.findIndex(c => c.id === updatedNext.id);
      if (mIdx !== -1) {
        state.machineDeck[mIdx] = { ...updatedNext };
      }
    }

    return {
      success: true,
      result: {
        damage: 0,
        message: 'Jugador usa defensa.',
        isKo: false,
        relevo: false,
        newActiveCard: null
      },
      state
    };
  }

  if (action === 'special') {
    const result = useSpecial(activePlayer, activeMachine, options);
    if (!result.success && result.damage === 0) {
      return { success: false, message: result.message };
    }

    const outcome = processActionOutcome(state, result.attacker, result.defender, result, true);

    const logEntry = buildAttackLog('Jugador', activePlayer.special?.name || 'Poder Especial', result);
    state.log.push(logEntry);

    return {
      success: true,
      result: { ...enrichActionResult(result, outcome), message: logEntry },
      state
    };
  }

  return { success: false, message: 'Acción no válida.' };
}

export function performMachineAction(state, options = {}) {
  const activePlayer = state.activePlayerCard;
  const activeMachine = state.activeMachineCard;

  if (!activePlayer || !activeMachine) {
    return { success: false, message: 'No hay cartas activas.' };
  }

  if (state.currentTurn !== 'machine') {
    return { success: false, message: 'Todavía no es el turno de la máquina.' };
  }

  const action = options.actionOverride || chooseMachineAction(activeMachine, activePlayer);

  if (action === 'defend') {
    const defended = defend(activeMachine);
    state.activeMachineCard = defended;
    
    const idx = state.machineDeck.findIndex(c => c.id === defended.id);
    if (idx !== -1) {
      state.machineDeck[idx] = { ...defended };
    }

    state.log.push('Máquina usa defensa.');

    state.currentTurn = 'player';
    if (state.activePlayerCard) {
      const updatedNext = progressCardTurn(state.activePlayerCard);
      state.activePlayerCard = updatedNext;
      const pIdx = state.playerDeck.findIndex(c => c.id === updatedNext.id);
      if (pIdx !== -1) {
        state.playerDeck[pIdx] = { ...updatedNext };
      }
    }

    return {
      success: true,
      action,
      result: {
        damage: 0,
        message: 'Máquina usa defensa.',
        isKo: false,
        relevo: false,
        newActiveCard: null
      },
      state
    };
  }

  if (action === 'special') {
    const result = useSpecial(activeMachine, activePlayer, options);
    const outcome = processActionOutcome(state, result.attacker, result.defender, result, false);

    const logEntry = buildAttackLog('Máquina', activeMachine.special?.name || 'poder especial', result);
    state.log.push(logEntry);

    return {
      success: true,
      action,
      result: { ...enrichActionResult(result, outcome), message: logEntry },
      state
    };
  }

  const attackIndex = Number(action.replace('attack-', '')) - 1;
  const attack = activeMachine.attacks?.[attackIndex] || activeMachine.attacks?.[0];
  const result = applyAttack(activeMachine, activePlayer, attack, options);

  const outcome = processActionOutcome(state, activeMachine, activePlayer, result, false);

  const logEntry = buildAttackLog('Máquina', attack.name, result);
  state.log.push(logEntry);

  return {
    success: true,
    action,
    result: { ...enrichActionResult(result, outcome), message: logEntry },
    state
  };
}

function performAutomaticStruggle(state, actor, immunityLock) {
  const isPlayerAttacking = actor === 'player';
  const attacker = isPlayerAttacking ? state.activePlayerCard : state.activeMachineCard;
  const defender = isPlayerAttacking ? state.activeMachineCard : state.activePlayerCard;
  const damage = Math.floor(Math.random() * 10) + 1;
  const nextHp = Math.max(0, (defender.hp ?? 250) - damage);
  const result = {
    success: true,
    attacker: { ...attacker },
    defender: {
      ...defender,
      hp: nextHp,
      defeated: nextHp === 0,
      isDefending: false,
    },
    damage,
    finished: nextHp === 0,
    multiplier: immunityLock ? 0 : 1,
    effectMessage: null,
    isCritical: false,
    dodged: false,
    immunityBreak: immunityLock,
    message: immunityLock
      ? '¡FORCEJEO AUTOMÁTICO! La inmunidad causa daño residual.'
      : '¡FORCEJEO AUTOMÁTICO! Sin movimientos disponibles, causa daño residual.',
  };
  const outcome = processActionOutcome(state, attacker, defender, result, isPlayerAttacking);
  const actorLabel = isPlayerAttacking ? 'Jugador' : 'Máquina';
  const logEntry = buildAttackLog(actorLabel, 'Forcejeo', result);
  state.log.push(logEntry);

  return {
    success: true,
    action: 'struggle',
    result: { ...enrichActionResult(result, outcome), message: logEntry },
    state,
  };
}

export function performAutomaticAction(state, actor = state?.currentTurn) {
  if (!state || state.battleFinished || actor !== state.currentTurn) {
    return { success: false, message: 'No se puede ejecutar una acción automática en este turno.' };
  }

  if (actor !== 'player' && actor !== 'machine') {
    return { success: false, message: 'Participante automático no válido.' };
  }

  const attacker = actor === 'player' ? state.activePlayerCard : state.activeMachineCard;
  const defender = actor === 'player' ? state.activeMachineCard : state.activePlayerCard;
  const immunityLock = hasMutualImmunityLock(attacker, defender);
  const offensiveActions = getAvailableActions(attacker)
    .filter((availableAction) => availableAction !== 'defend');
  let action = actor === 'player'
    ? chooseAutomaticAction(attacker, defender)
    : chooseMachineAction(attacker, defender);

  if (offensiveActions.length === 0) {
    action = 'struggle';
  } else if (immunityLock && action === 'defend') {
    action = offensiveActions[0] || 'struggle';
  }

  if (!action) return { success: false, message: 'No hay acciones automáticas disponibles.' };

  if (action === 'struggle') {
    return performAutomaticStruggle(state, actor, immunityLock);
  }

  const automaticOptions = immunityLock ? { automaticImmunityBreak: true } : {};
  if (actor === 'machine') {
    return performMachineAction(state, { ...automaticOptions, actionOverride: action });
  }

  if (action === 'special' || action === 'defend') {
    return { ...performPlayerAction(state, action, null, automaticOptions), action };
  }

  const attackIndex = Number(action.replace('attack-', '')) - 1;
  return { ...performPlayerAction(state, 'attack', attackIndex, automaticOptions), action };
}

export async function finishGameSession(playerId, result, playerDeck, machineDeck, battleInfo = {}) {
  return finishBattle(playerId, result, playerDeck, machineDeck, battleInfo);
}

export function checkBattleWinner(state) {
  return evaluateBattleEnd(state.playerDeck, state.machineDeck);
}

