import { createBattle } from '../api/battlesApi.js';

export async function saveBattleRecord(battle) {
  if (!battle || !battle.playerId || !battle.playerNickname) {
    return { success: false, message: 'La batalla no tiene datos válidos.' };
  }

  const record = {
    id: battle.id || `battle-${Date.now()}`,
    playerId: battle.playerId,
    playerNickname: battle.playerNickname,
    result: battle.result || 'pending',
    pointsAwarded: battle.pointsAwarded || 0,
    playerDeck: battle.playerDeck || [],
    machineDeck: battle.machineDeck || [],
    startedAt: battle.startedAt || new Date().toISOString(),
    endedAt: battle.endedAt || new Date().toISOString(),
  };

  const saved = await createBattle(record);

  return {
    success: true,
    message: 'Partida guardada correctamente.',
    battle: saved,
  };
}
