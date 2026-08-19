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
  evaluateBattleEnd,
  replaceDefeatedCard,
  progressCardTurn,
} from './battleService.js';

export async function initializeGameSession() {
  const cards = await loadActiveCards();
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

export async function createCombatSession(playerDeck, machineDeck = []) {
  let finalMachineDeck = [...machineDeck];
  if (!finalMachineDeck || finalMachineDeck.length === 0) {
    const allCards = await loadActiveCards();
    finalMachineDeck = buildMachineDeck(playerDeck, allCards);
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

export function performPlayerAction(state, action, attackId = null) {
  const activePlayer = state.activePlayerCard;
  const activeMachine = state.activeMachineCard;

  if (!activePlayer || !activeMachine) {
    return { success: false, message: 'No hay cartas activas.' };
  }

  if (state.currentTurn !== 'player') {
    return { success: false, message: 'Es el turno de la máquina.' };
  }

  if (action === 'attack') {
    const attack = activePlayer.attacks?.[attackId] || activePlayer.attacks?.[0];
    if (!attack) {
      return { success: false, message: 'No hay ataques disponibles.' };
    }
    const result = applyAttack(activePlayer, activeMachine, attack);
    
    const outcome = processActionOutcome(state, activePlayer, activeMachine, result, true);

    state.log.push(`Jugador usa ${attack.name} y hace ${result.damage} daño.`);

    return {
      success: true,
      result: {
        damage: result.damage,
        message: `Jugador usa ${attack.name} y hace ${result.damage} daño.`,
        isKo: outcome.isKo,
        relevo: outcome.relevo,
        newActiveCard: outcome.newActiveCard
      },
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
    const result = useSpecial(activePlayer, activeMachine);
    if (result.damage === 0 && (result.message.includes('No se puede') || result.message.includes('cooldown') || result.message.includes('desbloqueado'))) {
      return { success: false, message: result.message };
    }

    const outcome = processActionOutcome(state, result.attacker, result.defender, result, true);

    state.log.push(`Jugador usa ${activePlayer.special?.name || 'Poder Especial'} y hace ${result.damage} daño.`);

    return {
      success: true,
      result: {
        damage: result.damage,
        message: `Jugador usa ${activePlayer.special?.name || 'Poder Especial'} y hace ${result.damage} daño.`,
        isKo: outcome.isKo,
        relevo: outcome.relevo,
        newActiveCard: outcome.newActiveCard
      },
      state
    };
  }

  return { success: false, message: 'Acción no válida.' };
}

export function performMachineAction(state) {
  const activePlayer = state.activePlayerCard;
  const activeMachine = state.activeMachineCard;

  if (!activePlayer || !activeMachine) {
    return { success: false, message: 'No hay cartas activas.' };
  }

  if (state.currentTurn !== 'machine') {
    return { success: false, message: 'Todavía no es el turno de la máquina.' };
  }

  const action = chooseMachineAction(activeMachine);

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
    const result = useSpecial(activeMachine, activePlayer);
    const outcome = processActionOutcome(state, result.attacker, result.defender, result, false);

    state.log.push(`Máquina usa ${activeMachine.special?.name || 'poder especial'}.`);

    return {
      success: true,
      action,
      result: {
        damage: result.damage,
        message: `Máquina usa ${activeMachine.special?.name || 'poder especial'} y hace ${result.damage} daño.`,
        isKo: outcome.isKo,
        relevo: outcome.relevo,
        newActiveCard: outcome.newActiveCard
      },
      state
    };
  }

  const attackIndex = Number(action.replace('attack-', '')) - 1;
  const attack = activeMachine.attacks?.[attackIndex] || activeMachine.attacks?.[0];
  const result = applyAttack(activeMachine, activePlayer, attack);

  const outcome = processActionOutcome(state, activeMachine, activePlayer, result, false);

  state.log.push(`Máquina usa ${attack.name} y hace ${result.damage} daño.`);

  return {
    success: true,
    action,
    result: {
      damage: result.damage,
      message: `Máquina usa ${attack.name} y hace ${result.damage} daño.`,
      isKo: outcome.isKo,
      relevo: outcome.relevo,
      newActiveCard: outcome.newActiveCard
    },
    state
  };
}

export async function finishGameSession(playerId, result, playerDeck, machineDeck, battleInfo = {}) {
  return finishBattle(playerId, result, playerDeck, machineDeck, battleInfo);
}

export function checkBattleWinner(state) {
  return evaluateBattleEnd(state.playerDeck, state.machineDeck);
}

