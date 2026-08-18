export function isValidNickname(value) {
  if (typeof value !== 'string') return false;
  return value.trim().length >= 3;
}

export function hasExactDeckSize(deck, expected = 5) {
  return Array.isArray(deck) && deck.length === expected;
}

export function areDifferentCards(cards) {
  const ids = cards.map((card) => card.id);
  return new Set(ids).size === ids.length;
}

export function isCardActive(card) {
  return Boolean(card && card.active !== false);
}
