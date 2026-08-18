import { getPlayers, createPlayer, updatePlayer } from '../api/playersApi.js';
import { validateNickname } from './playerService.js';

export async function findPlayerByNickname(nickname) {
  const validation = validateNickname(nickname);
  if (!validation.valid) {
    return { valid: false, message: validation.message, player: null };
  }

  const players = await getPlayers();
  const match = players.find((player) => player.nickname === validation.value);

  if (match) {
    return {
      valid: false,
      message: 'El nickname ya existe.',
      player: match,
    };
  }

  return {
    valid: true,
    message: 'Nickname disponible.',
    player: null,
  };
}

export async function registerPlayer(nickname) {
  const validation = validateNickname(nickname);
  if (!validation.valid) {
    return { success: false, message: validation.message, player: null };
  }

  const existing = await getPlayers();
  const duplicate = existing.find((player) => player.nickname === validation.value);

  if (duplicate) {
    return {
      success: false,
      message: 'El nickname ya existe.',
      player: duplicate,
    };
  }

  const newPlayer = {
    id: `player-${Date.now()}`,
    nickname: validation.value,
    points: 0,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    createdAt: new Date().toISOString(),
  };

  const saved = await createPlayer(newPlayer);

  return {
    success: true,
    message: 'Jugador registrado correctamente.',
    player: saved,
  };
}

export async function updatePlayerStats(playerId, result) {
  const players = await getPlayers();
  const target = players.find((player) => player.id === playerId);

  if (!target) {
    return { success: false, message: 'Jugador no encontrado.' };
  }

  const updated = {
    ...target,
    points: result === 'win' ? target.points + 50 : target.points + 10,
    wins: result === 'win' ? target.wins + 1 : target.wins,
    losses: result === 'loss' ? target.losses + 1 : target.losses,
    gamesPlayed: target.gamesPlayed + 1,
  };

  const saved = await updatePlayer(playerId, updated);

  return {
    success: true,
    message: 'Estadísticas actualizadas.',
    player: saved,
  };
}
