/**
 * Tabla de tipos, debilidades, resistencias e inmunidades según la especificación
 * oficial de Pokémon (con tipos actualizados incluyendo Hada).
 *
 * Multiplicadores:
 * - 2: Muy débil contra / Eficaz (Daño x2 - Superefectivo)
 * - 1: Vulnerable / Estándar (Daño x1 - Normal)
 * - 0.5: Resistente / Poco eficaz (Daño x0.5)
 * - 0: Inmune / Sin efecto (Daño x0)
 */

export const TYPE_ALIASES = {
  normal: 'normal',
  lucha: 'lucha',
  fighting: 'lucha',
  volador: 'volador',
  flying: 'volador',
  veneno: 'veneno',
  poison: 'veneno',
  tierra: 'tierra',
  ground: 'tierra',
  roca: 'roca',
  rock: 'roca',
  bicho: 'bicho',
  bug: 'bicho',
  fantasma: 'fantasma',
  ghost: 'fantasma',
  acero: 'acero',
  steel: 'acero',
  fuego: 'fuego',
  fire: 'fuego',
  agua: 'agua',
  water: 'agua',
  planta: 'planta',
  grass: 'planta',
  electrico: 'electrico',
  electric: 'electrico',
  psiquico: 'psiquico',
  psychic: 'psiquico',
  hielo: 'hielo',
  ice: 'hielo',
  dragon: 'dragon',
  siniestro: 'siniestro',
  dark: 'siniestro',
  hada: 'hada',
  fairy: 'hada',
};

/**
 * Matriz de Efectividad:
 * Clave externa: Tipo del Pokémon Defensor
 * Clave interna: Tipo del Ataque
 * Valor: Multiplicador (por defecto 1 si no está listado)
 */
export const TYPE_CHART = {
  normal: {
    lucha: 2,
    fantasma: 0,
  },
  lucha: {
    volador: 2,
    roca: 0.5,
    bicho: 0.5,
    psiquico: 2,
    siniestro: 0.5,
    hada: 2,
  },
  volador: {
    lucha: 0.5,
    tierra: 0,
    roca: 2,
    bicho: 0.5,
    planta: 0.5,
    electrico: 2,
    hielo: 2,
  },
  veneno: {
    lucha: 0.5,
    veneno: 0.5,
    tierra: 2,
    bicho: 0.5,
    planta: 0.5,
    psiquico: 2,
    hada: 0.5,
  },
  tierra: {
    veneno: 0.5,
    roca: 0.5,
    agua: 2,
    planta: 2,
    electrico: 0,
    hielo: 2,
  },
  roca: {
    normal: 0.5,
    lucha: 2,
    volador: 0.5,
    veneno: 0.5,
    tierra: 2,
    acero: 2,
    fuego: 0.5,
    agua: 2,
    planta: 2,
  },
  bicho: {
    lucha: 0.5,
    volador: 2,
    tierra: 0.5,
    roca: 2,
    fuego: 2,
    planta: 0.5,
  },
  fantasma: {
    normal: 0,
    lucha: 0,
    veneno: 0.5,
    bicho: 0.5,
    fantasma: 2,
    siniestro: 2,
  },
  acero: {
    normal: 0.5,
    lucha: 2,
    volador: 0.5,
    veneno: 0,
    tierra: 2,
    roca: 0.5,
    bicho: 0.5,
    acero: 0.5,
    fuego: 2,
    planta: 0.5,
    psiquico: 0.5,
    hielo: 0.5,
    dragon: 0.5,
    hada: 0.5,
  },
  fuego: {
    tierra: 2,
    roca: 2,
    bicho: 0.5,
    acero: 0.5,
    fuego: 0.5,
    agua: 2,
    planta: 0.5,
    hielo: 0.5,
    hada: 0.5,
  },
  agua: {
    acero: 0.5,
    fuego: 0.5,
    agua: 0.5,
    planta: 2,
    electrico: 2,
    hielo: 0.5,
  },
  planta: {
    volador: 2,
    veneno: 2,
    tierra: 0.5,
    bicho: 2,
    fuego: 2,
    agua: 0.5,
    planta: 0.5,
    electrico: 0.5,
    hielo: 2,
  },
  electrico: {
    volador: 0.5,
    tierra: 2,
    acero: 0.5,
    electrico: 0.5,
  },
  psiquico: {
    lucha: 0.5,
    bicho: 2,
    fantasma: 2,
    psiquico: 0.5,
    siniestro: 2,
  },
  hielo: {
    lucha: 2,
    roca: 2,
    acero: 2,
    fuego: 2,
    hielo: 0.5,
  },
  dragon: {
    fuego: 0.5,
    agua: 0.5,
    planta: 0.5,
    electrico: 0.5,
    hielo: 2,
    dragon: 2,
    hada: 2,
  },
  siniestro: {
    lucha: 2,
    bicho: 2,
    fantasma: 0.5,
    psiquico: 0,
    siniestro: 0.5,
    hada: 2,
  },
  hada: {
    lucha: 0.5,
    veneno: 2,
    bicho: 0.5,
    acero: 2,
    dragon: 0,
    siniestro: 0.5,
  },
};

/**
 * Normaliza un tipo a minúsculas y sin acentos.
 */
export function normalizeType(type) {
  if (!type || typeof type !== 'string') return 'normal';
  const clean = type
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return TYPE_ALIASES[clean] || clean;
}

/**
 * Retorna el multiplicador de daño según el tipo del ataque y el tipo del defensor.
 * @param {string} attackType Tipo del ataque realizado
 * @param {string} defenderType Tipo del Pokémon que recibe el ataque
 * @returns {number} 2 (supereficaz), 1 (estándar), 0.5 (resistente), 0 (inmune)
 */
export function getTypeMultiplier(attackType, defenderType) {
  const normAttack = normalizeType(attackType);
  const normDefender = normalizeType(defenderType);

  if (TYPE_CHART[normDefender] && TYPE_CHART[normDefender][normAttack] !== undefined) {
    return TYPE_CHART[normDefender][normAttack];
  }

  return 1;
}

/**
 * Retorna el texto descriptivo de efectividad de un ataque.
 * @param {number} multiplier Multiplicador de tipo
 * @returns {string|null} Mensaje o null si es daño neutro
 */
export function getTypeEffectivenessMessage(multiplier) {
  if (multiplier >= 2) return '¡Es muy eficaz!';
  if (multiplier === 0) return '¡No tuvo ningún efecto!';
  if (multiplier < 1) return 'No es muy eficaz...';
  return null;
}

/**
 * Retorna la información visual de efectividad para previsualizar en la UI.
 */
export function getTypeBadgeInfo(attackType, defenderType) {
  const multiplier = getTypeMultiplier(attackType, defenderType);
  if (multiplier >= 2) {
    return { multiplier, label: 'x2 ¡Eficaz!', cssClass: 'text-success font-bold' };
  }
  if (multiplier === 0) {
    return { multiplier, label: 'x0 Inmune', cssClass: 'text-danger font-bold' };
  }
  if (multiplier < 1) {
    return { multiplier, label: 'x0.5 Poco eficaz', cssClass: 'text-warning font-bold' };
  }
  return { multiplier, label: 'x1', cssClass: 'text-muted' };
}
