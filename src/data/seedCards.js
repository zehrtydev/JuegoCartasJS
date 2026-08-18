export const cardTemplate = {
  id: 'card-001',
  name: 'Pikachu',
  type: 'Eléctrico',
  element: 'electric',
  image: '/images/cards/pikachu.webp',
  description: 'Rápido y con gran impulso eléctrico.',
  hp: 250,
  attacks: [
    { id: 'attack-01', name: 'Impactrueno', baseDamage: 20 },
    { id: 'attack-02', name: 'Rayo veloz', baseDamage: 30 },
    { id: 'attack-03', name: 'Chispazo', baseDamage: 40 },
    { id: 'attack-04', name: 'Relámpago', baseDamage: 50 }
  ],
  defense: {
    name: 'Escudo eléctrico',
    damageReduction: 0.5
  },
  special: {
    name: 'Rayo final',
    baseDamage: 65,
    unlockTurn: 2,
    cooldown: 3
  },
  sounds: {
    attack: '/sounds/attack-electric.mp3',
    defense: '/sounds/defense-electric.mp3',
    special: '/sounds/special-electric.mp3',
    defeated: '/sounds/defeated.mp3'
  },
  active: true,
  createdAt: '2026-08-17T00:00:00.000Z'
};

export const seedCards = [
  {
    id: 'card-001',
    name: 'Pikachu',
    type: 'Eléctrico',
    element: 'electric',
    image: '/images/cards/pikachu.webp',
    description: 'Rápido y con gran impulso eléctrico.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Impactrueno', baseDamage: 20 },
      { id: 'attack-02', name: 'Rayo veloz', baseDamage: 30 },
      { id: 'attack-03', name: 'Chispazo', baseDamage: 40 },
      { id: 'attack-04', name: 'Relámpago', baseDamage: 50 }
    ],
    defense: { name: 'Escudo eléctrico', damageReduction: 0.5 },
    special: { name: 'Rayo final', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-electric.mp3',
      defense: '/sounds/defense-electric.mp3',
      special: '/sounds/special-electric.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-002',
    name: 'Bulbasaur',
    type: 'Planta',
    element: 'grass',
    image: '/images/cards/bulbasaur.webp',
    description: 'Ataca con resistencia y presión continua.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Latigazo', baseDamage: 20 },
      { id: 'attack-02', name: 'Hoja afilada', baseDamage: 30 },
      { id: 'attack-03', name: 'Rizo vegetal', baseDamage: 40 },
      { id: 'attack-04', name: 'Vine Whip', baseDamage: 50 }
    ],
    defense: { name: 'Coraza de hojas', damageReduction: 0.5 },
    special: { name: 'Ráfaga verde', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-grass.mp3',
      defense: '/sounds/defense-grass.mp3',
      special: '/sounds/special-grass.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-003',
    name: 'Charmander',
    type: 'Fuego',
    element: 'fire',
    image: '/images/cards/charmander.webp',
    description: 'Combate ofensivo con explosión de calor.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Ascuas', baseDamage: 20 },
      { id: 'attack-02', name: 'Llama ardiente', baseDamage: 30 },
      { id: 'attack-03', name: 'Puño ígneo', baseDamage: 40 },
      { id: 'attack-04', name: 'Bola de fuego', baseDamage: 50 }
    ],
    defense: { name: 'Manto de humo', damageReduction: 0.5 },
    special: { name: 'Furia solar', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-fire.mp3',
      defense: '/sounds/defense-fire.mp3',
      special: '/sounds/special-fire.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-004',
    name: 'Squirtle',
    type: 'Agua',
    element: 'water',
    image: '/images/cards/squirtle.webp',
    description: 'Defensa sólida y golpes constantes.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Pistola de agua', baseDamage: 20 },
      { id: 'attack-02', name: 'Burbuja', baseDamage: 30 },
      { id: 'attack-03', name: 'Chorro', baseDamage: 40 },
      { id: 'attack-04', name: 'Hidrobomba', baseDamage: 50 }
    ],
    defense: { name: 'Caparazón', damageReduction: 0.5 },
    special: { name: 'Tormenta marina', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-water.mp3',
      defense: '/sounds/defense-water.mp3',
      special: '/sounds/special-water.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-005',
    name: 'Gengar',
    type: 'Fantasma',
    element: 'ghost',
    image: '/images/cards/gengar.webp',
    description: 'Sutileza y presión psicológica en combate.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Miedo', baseDamage: 20 },
      { id: 'attack-02', name: 'Beso sombra', baseDamage: 30 },
      { id: 'attack-03', name: 'Maldición', baseDamage: 40 },
      { id: 'attack-04', name: 'Rayo oscuro', baseDamage: 50 }
    ],
    defense: { name: 'Velocidad de sombra', damageReduction: 0.5 },
    special: { name: 'Noche total', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-ghost.mp3',
      defense: '/sounds/defense-ghost.mp3',
      special: '/sounds/special-ghost.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-006',
    name: 'Snorlax',
    type: 'Normal',
    element: 'normal',
    image: '/images/cards/snorlax.webp',
    description: 'Resistencia brutal y golpe pesado.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Golpe pesado', baseDamage: 20 },
      { id: 'attack-02', name: 'Puño de peso', baseDamage: 30 },
      { id: 'attack-03', name: 'Hiperpuño', baseDamage: 40 },
      { id: 'attack-04', name: 'Desgaste', baseDamage: 50 }
    ],
    defense: { name: 'Escudo físico', damageReduction: 0.5 },
    special: { name: 'Reposo imparable', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-normal.mp3',
      defense: '/sounds/defense-normal.mp3',
      special: '/sounds/special-normal.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-007',
    name: 'Machamp',
    type: 'Lucha',
    element: 'fighting',
    image: '/images/cards/machamp.webp',
    description: 'Golpes explosivos de alta potencia.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Patada baja', baseDamage: 20 },
      { id: 'attack-02', name: 'Puñetazo', baseDamage: 30 },
      { id: 'attack-03', name: 'Corte brutal', baseDamage: 40 },
      { id: 'attack-04', name: 'Golpe definitivo', baseDamage: 50 }
    ],
    defense: { name: 'Guardia de hierro', damageReduction: 0.5 },
    special: { name: 'Combo devastador', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-fighting.mp3',
      defense: '/sounds/defense-fighting.mp3',
      special: '/sounds/special-fighting.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-008',
    name: 'Jigglypuff',
    type: 'Hada',
    element: 'fairy',
    image: '/images/cards/jigglypuff.webp',
    description: 'Control del ritmo y presión sostenida.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Bola de sueño', baseDamage: 20 },
      { id: 'attack-02', name: 'Canción calma', baseDamage: 30 },
      { id: 'attack-03', name: 'Risa dulce', baseDamage: 40 },
      { id: 'attack-04', name: 'Pompom lunar', baseDamage: 50 }
    ],
    defense: { name: 'Burbuja de luz', damageReduction: 0.5 },
    special: { name: 'Armonía mágica', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-fairy.mp3',
      defense: '/sounds/defense-fairy.mp3',
      special: '/sounds/special-fairy.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-009',
    name: 'Eevee',
    type: 'Normal',
    element: 'normal',
    image: '/images/cards/eevee.webp',
    description: 'Versátil y competitivo en cualquier situación.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Mordisco', baseDamage: 20 },
      { id: 'attack-02', name: 'Cola rápida', baseDamage: 30 },
      { id: 'attack-03', name: 'Impacto ágil', baseDamage: 40 },
      { id: 'attack-04', name: 'Patada veloz', baseDamage: 50 }
    ],
    defense: { name: 'Esquiva ligera', damageReduction: 0.5 },
    special: { name: 'Cambio de forma', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-normal.mp3',
      defense: '/sounds/defense-normal.mp3',
      special: '/sounds/special-normal.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-010',
    name: 'Venusaur',
    type: 'Planta',
    element: 'grass',
    image: '/images/cards/venusaur.webp',
    description: 'Poder de campo y capacidad defensiva alta.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Ramita', baseDamage: 20 },
      { id: 'attack-02', name: 'Doble hoja', baseDamage: 30 },
      { id: 'attack-03', name: 'Torbellino verde', baseDamage: 40 },
      { id: 'attack-04', name: 'Rayo solar', baseDamage: 50 }
    ],
    defense: { name: 'Barrera floral', damageReduction: 0.5 },
    special: { name: 'Marea verde', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-grass.mp3',
      defense: '/sounds/defense-grass.mp3',
      special: '/sounds/special-grass.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-011',
    name: 'Blastoise',
    type: 'Agua',
    element: 'water',
    image: '/images/cards/blastoise.webp',
    description: 'Capaz de sostener presión y defenderse.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Pistola acuosa', baseDamage: 20 },
      { id: 'attack-02', name: 'Pulso de mar', baseDamage: 30 },
      { id: 'attack-03', name: 'Cascada', baseDamage: 40 },
      { id: 'attack-04', name: 'Turbo agua', baseDamage: 50 }
    ],
    defense: { name: 'Caparazón acuático', damageReduction: 0.5 },
    special: { name: 'Maremoto', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-water.mp3',
      defense: '/sounds/defense-water.mp3',
      special: '/sounds/special-water.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-012',
    name: 'Charizard',
    type: 'Fuego',
    element: 'fire',
    image: '/images/cards/charizard.webp',
    description: 'Ataque alto y gran capacidad ofensiva.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Llama', baseDamage: 20 },
      { id: 'attack-02', name: 'Ascua violenta', baseDamage: 30 },
      { id: 'attack-03', name: 'Vuelo ardiente', baseDamage: 40 },
      { id: 'attack-04', name: 'Tormenta de fuego', baseDamage: 50 }
    ],
    defense: { name: 'Alas de resistencia', damageReduction: 0.5 },
    special: { name: 'Llamarada final', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-fire.mp3',
      defense: '/sounds/defense-fire.mp3',
      special: '/sounds/special-fire.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-013',
    name: 'Lapras',
    type: 'Agua',
    element: 'water',
    image: '/images/cards/lapras.webp',
    description: 'Ritmo de combate estable con gran presión.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Oleaje', baseDamage: 20 },
      { id: 'attack-02', name: 'Choque marino', baseDamage: 30 },
      { id: 'attack-03', name: 'Ondas lentas', baseDamage: 40 },
      { id: 'attack-04', name: 'Presa azul', baseDamage: 50 }
    ],
    defense: { name: 'Escudo de hielo', damageReduction: 0.5 },
    special: { name: 'Tsunami helado', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-water.mp3',
      defense: '/sounds/defense-water.mp3',
      special: '/sounds/special-water.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-014',
    name: 'Alakazam',
    type: 'Psíquico',
    element: 'psychic',
    image: '/images/cards/alakazam.webp',
    description: 'Ataques precisos con gran alcance mental.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Mente activa', baseDamage: 20 },
      { id: 'attack-02', name: 'Psykick', baseDamage: 30 },
      { id: 'attack-03', name: 'Confusión', baseDamage: 40 },
      { id: 'attack-04', name: 'Pulso psíquico', baseDamage: 50 }
    ],
    defense: { name: 'Espejo mental', damageReduction: 0.5 },
    special: { name: 'Cerebro explosivo', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-psychic.mp3',
      defense: '/sounds/defense-psychic.mp3',
      special: '/sounds/special-psychic.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-015',
    name: 'Chansey',
    type: 'Normal',
    element: 'normal',
    image: '/images/cards/chansey.webp',
    description: 'Muy resistente y difícil de derribar.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Golpe suave', baseDamage: 20 },
      { id: 'attack-02', name: 'Patada rápida', baseDamage: 30 },
      { id: 'attack-03', name: 'Poder de apoyo', baseDamage: 40 },
      { id: 'attack-04', name: 'Bomba vital', baseDamage: 50 }
    ],
    defense: { name: 'Protección dulce', damageReduction: 0.5 },
    special: { name: 'Manto de vida', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-normal.mp3',
      defense: '/sounds/defense-normal.mp3',
      special: '/sounds/special-normal.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-016',
    name: 'Zapdos',
    type: 'Eléctrico',
    element: 'electric',
    image: '/images/cards/zapdos.webp',
    description: 'Velocidad y poder eléctrico extremo.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Trueno', baseDamage: 20 },
      { id: 'attack-02', name: 'Rayo veloz', baseDamage: 30 },
      { id: 'attack-03', name: 'Descarga', baseDamage: 40 },
      { id: 'attack-04', name: 'Tornado eléctrico', baseDamage: 50 }
    ],
    defense: { name: 'Ala de lluvia', damageReduction: 0.5 },
    special: { name: 'Tormenta suprema', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-electric.mp3',
      defense: '/sounds/defense-electric.mp3',
      special: '/sounds/special-electric.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-017',
    name: 'Mewtwo',
    type: 'Psíquico',
    element: 'psychic',
    image: '/images/cards/mewtwo.webp',
    description: 'Poder destruyente y muy ofensivo.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Psiquismo', baseDamage: 20 },
      { id: 'attack-02', name: 'Ataque mental', baseDamage: 30 },
      { id: 'attack-03', name: 'Explosión psíquica', baseDamage: 40 },
      { id: 'attack-04', name: 'Golpe Omega', baseDamage: 50 }
    ],
    defense: { name: 'Barrera mental', damageReduction: 0.5 },
    special: { name: 'Alma de batalla', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-psychic.mp3',
      defense: '/sounds/defense-psychic.mp3',
      special: '/sounds/special-psychic.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-018',
    name: 'Gyarados',
    type: 'Agua',
    element: 'water',
    image: '/images/cards/gyarados.webp',
    description: 'Potencia brutal y dominio del agua.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Salto fuerte', baseDamage: 20 },
      { id: 'attack-02', name: 'Mordida marina', baseDamage: 30 },
      { id: 'attack-03', name: 'Turbulencia', baseDamage: 40 },
      { id: 'attack-04', name: 'Ola devastadora', baseDamage: 50 }
    ],
    defense: { name: 'Escama dura', damageReduction: 0.5 },
    special: { name: 'Marea absoluta', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-water.mp3',
      defense: '/sounds/defense-water.mp3',
      special: '/sounds/special-water.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-019',
    name: 'Dragonite',
    type: 'Dragón',
    element: 'dragon',
    image: '/images/cards/dragonite.webp',
    description: 'Fuerza aérea y golpes de gran impacto.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Golpe de ala', baseDamage: 20 },
      { id: 'attack-02', name: 'Poder dracónico', baseDamage: 30 },
      { id: 'attack-03', name: 'Viento terrorífico', baseDamage: 40 },
      { id: 'attack-04', name: 'Ráfaga dragón', baseDamage: 50 }
    ],
    defense: { name: 'Piel dracónica', damageReduction: 0.5 },
    special: { name: 'Furia del cielo', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-dragon.mp3',
      defense: '/sounds/defense-dragon.mp3',
      special: '/sounds/special-dragon.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  },
  {
    id: 'card-020',
    name: 'Articuno',
    type: 'Hielo',
    element: 'ice',
    image: '/images/cards/articuno.webp',
    description: 'Control del hielo y estabilidad defensiva.',
    hp: 250,
    attacks: [
      { id: 'attack-01', name: 'Ráfaga helada', baseDamage: 20 },
      { id: 'attack-02', name: 'Pico de hielo', baseDamage: 30 },
      { id: 'attack-03', name: 'Corte congelante', baseDamage: 40 },
      { id: 'attack-04', name: 'Tormenta glacial', baseDamage: 50 }
    ],
    defense: { name: 'Escudo polar', damageReduction: 0.5 },
    special: { name: 'Borrasca helada', baseDamage: 65, unlockTurn: 2, cooldown: 3 },
    sounds: {
      attack: '/sounds/attack-ice.mp3',
      defense: '/sounds/defense-ice.mp3',
      special: '/sounds/special-ice.mp3',
      defeated: '/sounds/defeated.mp3'
    },
    active: true,
    createdAt: '2026-08-17T00:00:00.000Z'
  }
];
