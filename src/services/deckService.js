export function validateDeckSelection(selectedCards) {
  if (!Array.isArray(selectedCards)) return { valid: false, message: 'Debes seleccionar cartas.' };
  if (selectedCards.length !== 5) {
    return { valid: false, message: 'Debes elegir exactamente 5 cartas.' };
  }

  const ids = selectedCards.map((card) => card.id);
  const hasDuplicates = new Set(ids).size !== ids.length;

  if (hasDuplicates) {
    return { valid: false, message: 'No puedes repetir la misma carta.' };
  }

  return { valid: true, message: 'Mazo válido.' };
}

export function buildMachineDeck(playerDeck, allCards) {
  const available = allCards.filter((card) => !playerDeck.some((playerCard) => playerCard.id === card.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export function reorderDeck(cards, fromIndex, toIndex) {
  if (!Array.isArray(cards)) return cards;
  const copy = [...cards];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}
