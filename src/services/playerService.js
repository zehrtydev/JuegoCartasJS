export function validateNickname(nickname) {
  const normalized = typeof nickname === 'string' ? nickname.trim() : '';

  if (!normalized) {
    return {
      valid: false,
      value: '',
      message: 'El nickname es obligatorio.'
    };
  }

  if (normalized.length < 3) {
    return {
      valid: false,
      value: normalized,
      message: 'El nickname debe tener al menos 3 caracteres.'
    };
  }

  return {
    valid: true,
    value: normalized,
    message: 'Nickname válido.'
  };
}

export function createPlayerProfile(nickname) {
  const { value } = validateNickname(nickname);

  return {
    id: `player-${Date.now()}`,
    nickname: value,
    points: 0,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    createdAt: new Date().toISOString(),
  };
}
