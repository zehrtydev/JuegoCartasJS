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
  generateMachineDeck,
  startCombat,
  finishBattle,
} from './gameFlowService.js';
import { validateDeckSelection } from './deckService.js';
import { createBattleState, applyAttack, defend, useSpecial, chooseMachineAction, evaluateBattleEnd } from './battleService.js';

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

export function createCombatSession(playerDeck, machineDeck) {
  const { success, battle, message } = startCombat(playerDeck, machineDeck);
  return {
    success,
    state: battle,
    starter: battle.currentTurn,
    message,
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
    const result = applyAttack(activePlayer, activeMachine, attack);
    state.log.push(`Jugador usa ${attack.name} y hace ${result.damage} daño.`);

    if (result.finished) {
      state.winner = 'player';
      state.battleFinished = true;
    }

    return { success: true, result, state };
  }

  if (action === 'defend') {
    const defended = defend(activePlayer);
    state.activePlayerCard = defended;
    state.log.push('Jugador usa defensa.');
    return { success: true, result: defended, state };
  }

  if (action === 'special') {
    const result = useSpecial(activePlayer, activeMachine);
    state.log.push(result.message);
    if (result.finished) {
      state.winner = 'player';
      state.battleFinished = true;
    }
    return { success: true, result, state };
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
    activeMachine.isDefending = true;
    state.log.push('Máquina usa defensa.');
    return { success: true, action, state };
  }

  if (action === 'special') {
    const result = useSpecial(activeMachine, activePlayer);
    state.log.push(`Máquina usa ${activeMachine.special?.name || 'poder especial'}.`);
    if (result.finished) {
      state.winner = 'machine';
      state.battleFinished = true;
    }
    return { success: true, action, result, state };
  }

  const attackIndex = Number(action.replace('attack-', '')) - 1;
  const attack = activeMachine.attacks?.[attackIndex] || activeMachine.attacks?.[0];
  const result = applyAttack(activeMachine, activePlayer, attack);
  state.log.push(`Máquina usa ${attack.name} y hace ${result.damage} daño.`);

  if (result.finished) {
    state.winner = 'machine';
    state.battleFinished = true;
  }

  return { success: true, action, result, state };
}

export async function finishGameSession(playerId, result, playerDeck, machineDeck, battleInfo = {}) {
  return finishBattle(playerId, result, playerDeck, machineDeck, battleInfo);
}

export function checkBattleWinner(state) {
  return evaluateBattleEnd(state.playerDeck, state.machineDeck);
}
