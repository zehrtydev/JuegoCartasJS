export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function roundToInt(value) {
  return Math.round(value);
}

export function normalizeDamage(baseDamage) {
  const factor = 0.85 + Math.random() * 0.3;
  return roundToInt(baseDamage * factor);
}

export function createEmptyBattleState() {
  return {
    playerDeck: [],
    machineDeck: [],
    activePlayerCard: null,
    activeMachineCard: null,
    currentTurn: 'player',
    battleFinished: false,
    winner: null,
    logs: [],
  };
}

export function getRandomStarter() {
  return Math.random() < 0.5 ? 'player' : 'machine';
}

export function getNextTurn(currentTurn) {
  return currentTurn === 'player' ? 'machine' : 'player';
}

export function applyDefenseReduction(damage, isDefending) {
  if (!isDefending) return damage;
  return Math.round(damage * 0.5);
}

export function canUseSpecial(card, turnCount = 0) {
  if (!card?.special) return false;
  if (turnCount < card.special.unlockTurn) return false;
  return true;
}
