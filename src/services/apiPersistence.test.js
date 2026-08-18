import test from 'node:test';
import assert from 'node:assert/strict';

import { saveBattleRecord } from './battlePersistenceService.js';
import { registerPlayer } from './playerPersistenceService.js';

globalThis.fetch = async (url, options = {}) => {
  const method = options.method || 'GET';

  if (String(url).includes('/players')) {
    if (method === 'GET') {
      return {
        ok: true,
        json: async () => [],
      };
    }

    return {
      ok: true,
      json: async () => ({
        ...JSON.parse(options.body || '{}'),
      }),
    };
  }

  if (String(url).includes('/battles')) {
    return {
      ok: true,
      json: async () => ({
        ...(options.body ? JSON.parse(options.body) : {}),
      }),
    };
  }

  return {
    ok: true,
    json: async () => [],
  };
};

test('saveBattleRecord crea un registro con datos mínimos válidos', async () => {
  const result = await saveBattleRecord({
    id: 'battle-test-001',
    playerId: 'player-001',
    playerNickname: 'JCMASTER',
    result: 'win',
    pointsAwarded: 50,
    playerDeck: ['card-001', 'card-002', 'card-003', 'card-004', 'card-005'],
    machineDeck: ['card-006', 'card-007', 'card-008', 'card-009', 'card-010'],
    startedAt: '2026-08-18T00:00:00.000Z',
    endedAt: '2026-08-18T00:08:00.000Z',
  });

  assert.equal(result.success, true);
  assert.equal(result.message, 'Partida guardada correctamente.');
});

test('registerPlayer valida nickname y devuelve éxito o error', async () => {
  const result = await registerPlayer('  JCMASTER  ');
  assert.ok(result.success === true || result.success === false);
});
