import { createEmptyBattleState, getRandomStarter, getNextTurn } from '../utils/battleEngine.js';

export function createGameState(playerDeck = [], machineDeck = []) {
  const state = createEmptyBattleState();
  state.playerDeck = playerDeck;
  state.machineDeck = machineDeck;
  state.activePlayerCard = playerDeck[0] || null;
  state.activeMachineCard = machineDeck[0] || null;
  state.currentTurn = getRandomStarter();
  return state;
}

export function getActiveCard(deck) {
  return deck.find((card) => !card.defeated) || deck[0] || null;
}

export function advanceTurn(state) {
  if (!state) return state;
  state.currentTurn = getNextTurn(state.currentTurn);
  return state;
}

export function markDefeated(card) {
  if (!card) return card;
  card.defeated = true;
  return card;
}

export function isDeckDefeated(deck) {
  return Array.isArray(deck) && deck.length > 0 && deck.every((card) => card.defeated);
}
