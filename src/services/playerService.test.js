import test from 'node:test';
import assert from 'node:assert/strict';

import { validateNickname, createPlayerProfile } from './playerService.js';
import { validateDeckSelection } from './deckService.js';

test('validateNickname acepta un nickname válido y normaliza espacios', () => {
  const result = validateNickname('  JCMASTER  ');
  assert.deepEqual(result, {
    valid: true,
    value: 'JCMASTER',
    message: 'Nickname válido.'
  });
});

test('validateNickname rechaza nicknames vacíos o muy cortos', () => {
  assert.deepEqual(validateNickname('  '), {
    valid: false,
    value: '',
    message: 'El nickname es obligatorio.'
  });

  assert.deepEqual(validateNickname('ab'), {
    valid: false,
    value: 'ab',
    message: 'El nickname debe tener al menos 3 caracteres.'
  });
});

test('createPlayerProfile crea el objeto del jugador con puntajes iniciales', () => {
  const player = createPlayerProfile('JCMASTER');
  assert.equal(player.nickname, 'JCMASTER');
  assert.equal(player.points, 0);
  assert.equal(player.wins, 0);
  assert.equal(player.losses, 0);
  assert.equal(player.gamesPlayed, 0);
  assert.ok(player.id.startsWith('player-'));
});

test('validateDeckSelection acepta un mazo válido de 5 cartas únicas', () => {
  const cards = [
    { id: 'card-001' },
    { id: 'card-002' },
    { id: 'card-003' },
    { id: 'card-004' },
    { id: 'card-005' }
  ];

  assert.deepEqual(validateDeckSelection(cards), {
    valid: true,
    message: 'Mazo válido.'
  });
});

test('validateDeckSelection rechaza mazos repetidos o con cantidad incorrecta', () => {
  const invalidLength = [
    { id: 'card-001' },
    { id: 'card-002' },
    { id: 'card-003' }
  ];

  const duplicateCards = [
    { id: 'card-001' },
    { id: 'card-001' },
    { id: 'card-003' },
    { id: 'card-004' },
    { id: 'card-005' }
  ];

  assert.deepEqual(validateDeckSelection(invalidLength), {
    valid: false,
    message: 'Debes elegir exactamente 5 cartas.'
  });

  assert.deepEqual(validateDeckSelection(duplicateCards), {
    valid: false,
    message: 'No puedes repetir la misma carta.'
  });
});
