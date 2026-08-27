import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveHistoryCard, resolveHistoryDeck } from './historyDeck.js'

const catalog = [
  { id: 'card-001', number: 1, name: 'Bulbasaur', imageUrl: '/bulbasaur.png' },
  { id: 'card-025', number: 25, name: 'Pikachu', imageUrl: '/pikachu.png' },
]

test('resuelve un ID persistido a nombre y sprite del catálogo', () => {
  const card = resolveHistoryCard('card-025', catalog)

  assert.equal(card.id, 'card-025')
  assert.equal(card.name, 'Pikachu')
  assert.equal(card.spriteUrl, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')
})

test('resuelve equipos y conserva un fallback para cartas ausentes', () => {
  const deck = resolveHistoryDeck(['card-001', 'card-deleted'], catalog)

  assert.deepEqual(deck.map(({ name }) => name), ['Bulbasaur', 'card-deleted'])
  assert.equal(deck[1].spriteUrl, '')
})

test('acepta objetos de carta en registros importados', () => {
  const card = resolveHistoryCard({ id: 'card-999', name: 'Carta histórica', image: '/legacy.png' }, [])

  assert.equal(card.name, 'Carta histórica')
  assert.equal(card.spriteUrl, '/legacy.png')
})
