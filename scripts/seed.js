import fs from 'node:fs/promises';
import path from 'node:path';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanMoveName(moveName) {
  return moveName.split('-').map(capitalize).join(' ');
}

const SUPPORTED_SOUNDS = ['electric', 'grass', 'fire', 'water', 'ghost', 'fighting', 'fairy', 'normal', 'psychic', 'dragon', 'ice'];

function getSoundsForType(type) {
  const element = SUPPORTED_SOUNDS.includes(type) ? type : 'normal';
  return {
    attack: `/sounds/attack-${element}.mp3`,
    defense: `/sounds/defense-${element}.mp3`,
    special: `/sounds/special-${element}.mp3`,
    defeated: `/sounds/defeated.mp3`
  };
}

async function seed() {
  console.log('Fetching 151 Pokémon from PokeAPI...');
  const cards = [];

  const CHUNK_SIZE = 20;
  for (let i = 1; i <= 151; i += CHUNK_SIZE) {
    const chunkPromises = [];
    const limit = Math.min(i + CHUNK_SIZE - 1, 151);
    for (let id = i; id <= limit; id++) {
      chunkPromises.push(
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          .then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch ID ${id}`);
            return res.json();
          })
          .catch((err) => {
            console.error(`Error fetching ID ${id}: ${err.message}`);
            return null;
          })
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    for (const pokemon of chunkResults) {
      if (!pokemon) continue;

      const idVal = `card-${String(pokemon.id).padStart(3, '0')}`;
      const number = pokemon.id;
      const name = capitalize(pokemon.name);
      const types = pokemon.types.map((t) => t.type.name);
      const primaryType = types[0] || 'normal';
      const typeLabel = capitalize(primaryType);

      const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || '';
      const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy || '';

      const moves = pokemon.moves || [];
      const move1 = moves[0] ? cleanMoveName(moves[0].move.name) : 'Tackle';
      const move2 = moves[1] ? cleanMoveName(moves[1].move.name) : 'Growl';
      const move3 = moves[2] ? cleanMoveName(moves[2].move.name) : 'Struggle';
      const move4 = moves[3] ? cleanMoveName(moves[3].move.name) : 'Quick Attack';
      const specialMove = moves[4] ? cleanMoveName(moves[4].move.name) : 'Mega Punch';

      const card = {
        id: idVal,
        number,
        name,
        types,
        type: typeLabel,
        element: primaryType,
        image: imageUrl,
        imageUrl,
        description: `${name} es un Pokémon de tipo ${types.join('/')}.`,
        hp: 250,
        attacks: [
          { id: 'attack-01', name: move1, baseDamage: 20 },
          { id: 'attack-02', name: move2, baseDamage: 30 },
          { id: 'attack-03', name: move3, baseDamage: 40 },
          { id: 'attack-04', name: move4, baseDamage: 50 }
        ],
        defense: {
          name: `Escudo ${typeLabel}`,
          damageReduction: 0.5
        },
        special: {
          name: specialMove,
          baseDamage: 65,
          unlockTurn: 2,
          cooldown: 3
        },
        sounds: getSoundsForType(primaryType),
        cryUrl,
        active: true,
        createdAt: new Date().toISOString()
      };

      cards.push(card);
    }
    console.log(`Progress: fetched ${Math.min(limit, 151)} / 151...`);
  }

  cards.sort((a, b) => a.number - b.number);

  console.log(`Seeding complete. Fetched ${cards.length} cards.`);

  const adminObject = {
    id: 'admin-001',
    username: 'admin',
    password: 'cards2026'
  };

  const defaultDb = {
    admins: [adminObject],
    players: [],
    cards: cards,
    battles: []
  };

  const paths = [
    path.resolve('db.json'),
    path.resolve('src/data/db.json')
  ];

  for (const dbPath of paths) {
    let currentData = { ...defaultDb };
    try {
      const existingText = await fs.readFile(dbPath, 'utf8');
      if (existingText.trim()) {
        const parsed = JSON.parse(existingText);
        currentData.players = parsed.players || [];
        currentData.battles = parsed.battles || [];
        currentData.admins = parsed.admins || [adminObject];
        const adminIdx = currentData.admins.findIndex(a => a.username === 'admin');
        if (adminIdx !== -1) {
          currentData.admins[adminIdx] = adminObject;
        } else {
          currentData.admins.push(adminObject);
        }
      }
    } catch (e) {
      // file doesn't exist
    }

    currentData.cards = cards;

    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(currentData, null, 2), 'utf8');
    console.log(`Saved to ${dbPath}`);
  }
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
