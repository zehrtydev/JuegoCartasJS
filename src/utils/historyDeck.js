function getEntryId(entry) {
  if (entry && typeof entry === 'object') return entry.id
  return entry
}

function getSpriteUrl(card) {
  const number = Number(card?.number)
  if (Number.isInteger(number) && number > 0) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${number}.png`
  }

  return card?.imageUrl || card?.image || ''
}

/**
 * Resolves a persisted battle-card entry (usually an ID) against the catalog.
 * It also accepts a card object so imported/future records remain compatible.
 */
export function resolveHistoryCard(entry, cards = []) {
  const id = getEntryId(entry)
  const card = (Array.isArray(cards) ? cards : [])
    .find((catalogCard) => String(catalogCard?.id) === String(id))
  const fallback = entry && typeof entry === 'object' ? entry : {}
  const fallbackId = id == null || id === '' ? 'Carta no disponible' : String(id)

  return {
    id: fallbackId,
    name: card?.name || fallback.name || fallbackId,
    spriteUrl: getSpriteUrl(card || fallback),
  }
}

export function resolveHistoryDeck(deck, cards = []) {
  if (!Array.isArray(deck)) return []
  return deck.map((entry) => resolveHistoryCard(entry, cards))
}
