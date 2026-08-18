/**
 * José: flujo principal del juego, validaciones, persistencia y combate.
 * Manuel: componentes visuales, pantallas y experiencia de usuario.
 *
 * Este archivo representa el núcleo lógico del juego para que la UI
 * pueda consumir servicios sin reimplementarlos directamente.
 */
import { getCards } from '../api/cardsApi.js';
import { registerPlayer, updatePlayerStats } from './playerPersistenceService.js';
import { saveBattleRecord } from './battlePersistenceService.js';
import { validateDeckSelection } from './deckService.js';
import { createBattleState } from './battleService.js';

export async function loadActiveCards() {
  const cards = await getCards();
  return cards.filter((card) => card.active !== false);
}

export async function registerAndStartPlayer(nickname) {
  const result = await registerPlayer(nickname);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      player: result.player,
    };
  }

  return {
    success: true,
    message: 'Jugador registrado correctamente.',
    player: result.player,
  };
}

export function validateAndBuildDeck(selectedCards) {
  const validation = validateDeckSelection(selectedCards);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
      deck: [],
    };
  }

  return {
    success: true,
    message: 'Mazo válido.',
    deck: selectedCards,
  };
}

export function generateMachineDeck(playerDeck, allCards) {
  const available = allCards.filter(
    (card) => !playerDeck.some((selected) => selected.id === card.id)
  );

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export function startCombat(playerDeck, machineDeck) {
  const starter = Math.random() < 0.5 ? 'player' : 'machine';
  const battle = createBattleState(playerDeck, machineDeck, starter);

  return {
    success: true,
    battle,
    message: `Inicia ${starter === 'player' ? 'jugador' : 'máquina'}.`,
  };
}

export async function finishBattle(playerId, result, playerDeck, machineDeck, battleRecord) {
  const statsResult = await updatePlayerStats(playerId, result);
  const savedBattle = await saveBattleRecord({
    ...battleRecord,
    playerId,
    playerNickname: battleRecord?.playerNickname || 'unknown',
    result,
    pointsAwarded: result === 'win' ? 50 : 10,
    playerDeck: playerDeck.map((card) => card.id),
    machineDeck: machineDeck.map((card) => card.id),
  });

  return {
    success: true,
    stats: statsResult,
    battle: savedBattle,
  };
}
