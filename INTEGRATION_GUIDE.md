# Guía de Integración de UI - Para Manuel

**Objetivo:** Documentar cómo consumir los servicios del backend desde los componentes de UI.

---

## 📥 Cómo Importar los Servicios

Todos los servicios están disponibles desde el módulo principal `gameController`:

```javascript
import {
  initializeGameSession,
  registerPlayerSession,
  validateSelectedDeck,
  createCombatSession,
  performPlayerAction,
  performMachineAction,
  finishGameSession,
  checkBattleWinner,
} from '../services/gameController.js';
```

---

## 🎮 Casos de Uso Prácticos

### 1. Inicializar Sesión de Juego

**Cuándo:** Al cargar la app o reiniciar sesión.

```javascript
async function loadGameSetup() {
  const { success, cards, minCardsRequired } = await initializeGameSession();
  
  if (!success) {
    console.error('Error inicializando sesión');
    return;
  }
  
  // cards es Array de objetos con: id, name, hp, attacks, defense, special
  console.log(`Cargas disponibles: ${cards.length}`);
  console.log(`Mínimo requerido: ${minCardsRequired}`);
  
  // Renderizar grid de cartas
  renderCardGrid(cards);
}
```

---

### 2. Registrar Nuevo Jugador

**Cuándo:** Formulario de registro con input de nickname.

```javascript
async function handlePlayerRegistration(nicknameInput) {
  // nicknameInput es string desde <input>
  
  const result = await registerPlayerSession(nicknameInput);
  
  if (!result.success) {
    // Mostrar error en UI
    displayError(result.message); // Ej: "El nickname ya existe"
    return null;
  }
  
  // result.player contiene: id, nickname, points, wins, losses, gamesPlayed
  console.log(`Bienvenido ${result.player.nickname}`);
  
  // Guardar en sesión para usar después
  sessionStorage.setItem('currentPlayer', JSON.stringify(result.player));
  
  // Navegar a selección de mazo
  navigateToMazoSelection();
}
```

---

### 3. Validar Selección de Mazo

**Cuándo:** Jugador selecciona 5-10 cartas y hace click en "Confirmar Mazo".

```javascript
function handleMazoConfirmation(selectedCardIds) {
  // selectedCardIds es Array de IDs (strings)
  // Ej: ['card-1', 'card-5', 'card-12', ...]
  
  // Obtener objetos completos de cartas (desde el grid anterior)
  const selectedCards = allCards.filter(card => 
    selectedCardIds.includes(card.id)
  );
  
  const validation = validateSelectedDeck(selectedCards);
  
  if (!validation.valid) {
    displayError(validation.message); 
    // Mensajes posibles:
    // - "Debes seleccionar entre 5 y 10 cartas"
    // - "Todas las cartas deben ser diferentes"
    return;
  }
  
  console.log(`Mazo confirmado: ${validation.deck.length} cartas`);
  
  // Guardar mazo del jugador
  sessionStorage.setItem('playerDeck', JSON.stringify(selectedCards));
  
  // Pasar a arena de combate
  startBattleArena(selectedCards);
}
```

---

### 4. Iniciar Combate

**Cuándo:** Se confirma el mazo y está listo para pelear.

```javascript
async function startBattleArena(playerDeck) {
  // playerDeck es Array de cartas seleccionadas
  
  // La máquina genera su mazo automáticamente
  // Aquí solo llamamos a createCombatSession
  
  const { success, state, starter, message } = await createCombatSession(
    playerDeck,
    [] // La máquina construye su mazo internamente
  );
  
  if (!success) {
    displayError('Error al iniciar combate');
    return;
  }
  
  // state contiene la batalla inicial completa
  // state.playerDeck, state.machineDeck
  // state.activePlayerCard, state.activeMachineCard
  // state.currentTurn ('player' o 'machine')
  // state.log (Array de mensajes)
  
  console.log(`Turno inicial: ${starter === 'player' ? 'Jugador' : 'Máquina'}`);
  
  // Guardar estado en memoria
  battleState = state;
  
  // Renderizar arena
  renderBattleArena(state);
}
```

---

### 5. Ejecutar Acción del Jugador

**Cuándo:** Jugador hace click en botón de Atacar, Defenderse o Especial.

```javascript
// Opción A: Atacar con un ataque específico
async function handlePlayerAttack(attackIndex = 0) {
  const result = performPlayerAction(
    battleState,
    'attack',
    attackIndex // 0 para primer ataque, 1 para segundo, etc.
  );
  
  if (!result.success) {
    displayError(result.message);
    return;
  }
  
  // result.result contiene: damage, finished, newState
  battleState = result.state;
  
  // Renderizar cambios
  updateBattleDisplay(battleState, `Ataque: ${result.result.damage} daño`);
  
  // Si termina la batalla
  if (battleState.battleFinished) {
    endBattle();
    return;
  }
  
  // Siguiente turno (máquina)
  waitForMachineAction();
}

// Opción B: Defenderse
function handlePlayerDefend() {
  const result = performPlayerAction(battleState, 'defend');
  
  if (!result.success) {
    displayError(result.message);
    return;
  }
  
  battleState = result.state;
  updateBattleDisplay(battleState, 'Defensa activada');
  waitForMachineAction();
}

// Opción C: Poder especial
function handlePlayerSpecial() {
  const result = performPlayerAction(battleState, 'special');
  
  if (!result.success) {
    displayError(result.message);
    return;
  }
  
  battleState = result.state;
  updateBattleDisplay(battleState, result.result.message);
  
  if (battleState.battleFinished) {
    endBattle();
    return;
  }
  
  waitForMachineAction();
}
```

---

### 6. Turno de la Máquina

**Cuándo:** Después de cada acción del jugador.

```javascript
async function performMachineTurn() {
  const result = performMachineAction(battleState);
  
  if (!result.success) {
    displayError(result.message);
    return;
  }
  
  battleState = result.state;
  
  // Mostrar acción de máquina
  const actionLabel = {
    'defend': 'Defensa',
    'special': result.result?.message || 'Poder Especial',
  };
  
  if (result.action.startsWith('attack-')) {
    updateBattleDisplay(
      battleState, 
      `Máquina ataca: ${result.result?.damage || 0} daño`
    );
  } else {
    updateBattleDisplay(
      battleState,
      `Máquina usa ${actionLabel[result.action] || result.action}`
    );
  }
  
  // Si la batalla termina
  if (battleState.battleFinished) {
    endBattle();
    return;
  }
  
  // Volver al jugador
  enablePlayerActions();
}
```

---

### 7. Finalizar Batalla

**Cuándo:** Una cartas llega a 0 HP.

```javascript
async function endBattle() {
  // Determinar ganador
  const winner = checkBattleWinner(battleState);
  // winner es 'player' o 'machine'
  
  const currentPlayer = JSON.parse(sessionStorage.getItem('currentPlayer'));
  const playerDeck = JSON.parse(sessionStorage.getItem('playerDeck'));
  
  const result = winner === 'player' ? 'win' : 'loss';
  const pointsAwarded = result === 'win' ? 50 : 10;
  
  // Guardar batalla en BD
  const response = await finishGameSession(
    currentPlayer.id,
    result,
    playerDeck,
    battleState.machineDeck,
    {
      playerNickname: currentPlayer.nickname,
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
    }
  );
  
  if (!response.success) {
    console.error('Error guardando batalla:', response.message);
    return;
  }
  
  // Mostrar pantalla de resultados
  displayResultsScreen({
    winner,
    pointsAwarded,
    newStats: response.stats.player, // Stats actualizados del jugador
  });
  
  // Opción de volver a jugar
  setTimeout(() => {
    resetGame(); // Limpiar sesión
    navigateToMazoSelection();
  }, 3000);
}
```

---

## 🎨 Estructura de Datos de Referencia

### Objeto Card
```javascript
{
  id: 'card-1',
  name: 'Dragon Fuego',
  description: 'Dragón legendario de fuego',
  hp: 100,
  attacks: [
    { name: 'Llamarada', damage: 25, description: 'Ataque de fuego' },
    { name: 'Vuelo Ardiente', damage: 35, description: 'Ataque más fuerte' }
  ],
  defense: 15,
  special: {
    name: 'Apocalipsis de Fuego',
    damage: 60,
    description: 'Ataque devastador',
    cooldown: 3
  },
  active: true
}
```

### Objeto Player
```javascript
{
  id: 'player-1692547200000',
  nickname: 'JugadorX',
  points: 150,
  wins: 3,
  losses: 2,
  gamesPlayed: 5,
  createdAt: '2026-08-18T12:30:45.123Z'
}
```

### Objeto Battle State
```javascript
{
  id: 'battle-123',
  playerDeck: [/* Array de cartas del jugador */],
  machineDeck: [/* Array de cartas de la máquina */],
  activePlayerCard: { /* Carta activa jugador */ },
  activeMachineCard: { /* Carta activa máquina */ },
  currentTurn: 'player', // 'player' o 'machine'
  log: [
    'Jugador ataca y hace 25 daño',
    'Máquina se defiende'
  ],
  battleFinished: false,
  winner: null // 'player', 'machine' o null
}
```

---

## ⚠️ Manejo de Errores Comunes

### Nickname ya existe
```javascript
if (result.message.includes('ya existe')) {
  showModal('Este nickname ya está registrado, intenta otro');
}
```

### Mazo inválido
```javascript
if (!validation.valid) {
  showToast(`Error: ${validation.message}`);
  highlightInvalidCards(); // Función custom
}
```

### Acción en turno incorrecto
```javascript
if (result.message.includes('turno')) {
  showNotification('Espera tu turno');
  disablePlayerActions();
}
```

---

## 🔄 Estado Global Recomendado

Usa `sessionStorage` o estado local para mantener:

```javascript
// Sesión de usuario
sessionStorage.setItem('currentPlayer', JSON.stringify({
  id, nickname, points, wins, losses
}));

// Mazo seleccionado
sessionStorage.setItem('playerDeck', JSON.stringify([
  { id, name, hp, ... },
  // ... 5-10 cartas
]));

// Estado actual de batalla (opcional, si lo necesitas entre componentes)
let battleState = null; // Usar variable global o contexto

// Cartas disponibles (cachear después de cargar)
let allCards = []; // Resultado de initializeGameSession()
```

---

## 🎯 Checklist de Integración

- [ ] Importar `gameController` en componente principal
- [ ] Llamar `initializeGameSession()` al montar app
- [ ] Renderizar grid de cartas
- [ ] Formulario de registro con `registerPlayerSession()`
- [ ] Selector de mazo con `validateSelectedDeck()`
- [ ] Arena de batalla con `createCombatSession()`
- [ ] Botones de acciones con `performPlayerAction()`
- [ ] Loop de máquina con `performMachineAction()`
- [ ] Pantalla de resultados con `finishGameSession()`
- [ ] Volver a jugar (reiniciar flujo)

---

## 📞 Dudas Frecuentes

**P: ¿Cómo obtengo el mazo de la máquina?**  
R: Se genera automáticamente dentro de `createCombatSession()`. Está en `state.machineDeck`.

**P: ¿Puedo renderizar en tiempo real mientras se anima el ataque?**  
R: Sí, después de llamar `performPlayerAction()` actualiza `battleState` y re-renderiza.

**P: ¿Qué pasa si el jugador recarga la página durante una batalla?**  
R: La sesión se pierde (por ahora). Post-MVP se puede guardar estado en localStorage.

**P: ¿Cómo agrego sonidos?**  
R: Usa `<audio>` tag o librería como `Howler.js`. Dispara sonidos en `updateBattleDisplay()`.

---

**Última actualización:** 2026-08-18  
**Para:** Manuel (UI/UX)
