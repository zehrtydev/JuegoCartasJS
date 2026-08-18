# Card Battle Arena - Guía del Proyecto

**Versión:** 0.1.0  
**Estado:** Fase de lógica completada. Integración UI pendiente.

---

## 📋 División de Responsabilidades

### José
- Lógica de juego y dominio
- API y persistencia de datos
- Validaciones y reglas
- Testeo de funcionalidades
- Integración de servicios

### Manuel
- Interfaz de usuario (UI)
- Componentes visuales
- Estilos y diseño responsivo
- Animaciones y sonidos
- Experiencia de usuario (UX)

---

## ✅ Cambios Realizados

### 1. Arquitectura de Base de Datos
**Archivo:** [db.json](db.json)

Se creó la estructura de datos con cuatro entidades principales:
- **admins**: Credenciales de administradores
- **players**: Perfiles de jugadores con estadísticas
- **cards**: Catálogo de cartas disponibles
- **battles**: Registro histórico de partidas

```json
{
  "admins": [{ id, username, password, role, createdAt }],
  "players": [{ id, nickname, points, wins, losses, gamesPlayed, createdAt }],
  "cards": [{ id, name, hp, attacks, defense, special, active }],
  "battles": [{ id, playerId, playerNickname, result, pointsAwarded, ... }]
}
```

---

### 2. Capa de API
**Directorio:** [src/api/](src/api/)

Implementados 4 módulos de API REST simulada con fetch:

#### [apiConfig.js](src/api/apiConfig.js)
- Resolución de URL base (compatible Vite + Node)
- Helper `buildEndpoint(resource)` para construir URLs

#### [cardsApi.js](src/api/cardsApi.js)
- `getCards()` - Obtiene todas las cartas activas
- `getCardById(id)` - Obtiene carta específica
- `postCard(card)` - Crea nueva carta
- `putCard(id, card)` - Reemplaza carta completa
- `patchCard(id, updates)` - Actualiza parcialmente
- `deleteCard(id)` - Elimina carta

#### [playersApi.js](src/api/playersApi.js)
- `getPlayers()` - Lista de jugadores
- `getPlayerByNickname(nickname)` - Búsqueda por nombre
- `createPlayer(player)` - Registra nuevo jugador
- `updatePlayer(id, updates)` - Actualiza estadísticas

#### [adminsApi.js](src/api/adminsApi.js)
- `loginAdmin(username, password)` - Valida credenciales admin

#### [battlesApi.js](src/api/battlesApi.js)
- `createBattle(battle)` - Registra partida completada

---

### 3. Servicios de Dominio
**Directorio:** [src/services/](src/services/)

#### [playerService.js](src/services/playerService.js) - José
- `validateNickname(nickname)` - Valida formato y longitud (3+ caracteres)
- `createPlayerProfile(nickname)` - Crea perfil de jugador con datos iniciales

#### [deckService.js](src/services/deckService.js) - José
- `validateDeckSelection(cards)` - Valida 5-10 cartas únicas
- `buildMachineDeck(playerDeck, allCards)` - Genera mazo aleatorio para máquina
- `reorderDeck(deck)` - Reordena mazo según necesidad

#### [battleService.js](src/services/battleService.js) - José
Lógica completa de combate:
- `createBattleState(playerDeck, machineDeck, starter)` - Inicia batalla
- `applyAttack(attacker, defender, attack)` - Calcula daño
- `defend(card)` - Aplica defensa (reduce daño siguiente)
- `useSpecial(attacker, defender)` - Activa poder especial
- `chooseMachineAction(card)` - IA para decidir acción
- `evaluateBattleEnd(playerCards, machineCards)` - Determina ganador

#### [playerPersistenceService.js](src/services/playerPersistenceService.js) - José
- `findPlayerByNickname(nickname)` - Busca jugador existente
- `registerPlayer(nickname)` - Registra nuevo jugador en DB
- `updatePlayerStats(playerId, result)` - Actualiza wins/losses/points

#### [battlePersistenceService.js](src/services/battlePersistenceService.js) - José
- `saveBattleRecord(battle)` - Guarda registro de partida en DB

#### [gameFlowService.js](src/services/gameFlowService.js) - José
Orquestación del flujo completo:
- `loadActiveCards()` - Carga cartas disponibles
- `registerAndStartPlayer(nickname)` - Registra jugador
- `validateAndBuildDeck(selectedCards)` - Valida selección de mazo
- `generateMachineDeck(playerDeck, allCards)` - Crea mazo rival
- `startCombat(playerDeck, machineDeck)` - Inicia batalla
- `finishBattle(playerId, result, ...)` - Finaliza y guarda resultado

#### [gameController.js](src/services/gameController.js) - José (Interfaz para UI)
Puente entre lógica y componentes visuales:
- `initializeGameSession()` - Prepara sesión
- `registerPlayerSession(nickname)` - Registra jugador
- `validateSelectedDeck(selectedCards)` - Valida mazo
- `createCombatSession(playerDeck, machineDeck)` - Inicia combate
- `performPlayerAction(state, action, attackId)` - Ejecuta acción del jugador
- `performMachineAction(state)` - Ejecuta turno de máquina
- `finishGameSession(playerId, result, ...)` - Termina partida
- `checkBattleWinner(state)` - Evalúa ganador

---

### 4. Utilidades
**Directorio:** [src/utils/](src/utils/)

#### [validators.js](src/utils/validators.js) - José
- `isValidNickname(nickname)` - Verifica formato
- `hasExactDeckSize(cards, min, max)` - Valida cantidad
- `areDifferentCards(cards)` - Comprueba IDs únicos

#### [battleEngine.js](src/utils/battleEngine.js) - José
- `normalizeDamage(damage)` - Asegura entero válido
- `getRandomStarter()` - Decide quién empieza
- `applyDefenseReduction(damage, defense)` - Calcula defensa
- `canUseSpecial(card)` - Verifica disponibilidad de poder

---

### 5. Datos Iniciales
**Archivo:** [src/data/seedCards.js](src/data/seedCards.js)

Modeladas 20 cartas temáticas con:
- Nombres y descripciones
- HP, Ataque, Defensa, Especial
- Variaciones de poder para balance

> **Nota:** El seed está definido pero no insertado automáticamente en `db.json`. 
> Ver sección "Tareas Pendientes" para completar población de datos.

---

### 6. Validaciones y Testing
**Archivos de prueba:**
- [src/services/battleService.test.js](src/services/battleService.test.js) - ✅ 7/7 tests pasando
- [src/services/playerService.test.js](src/services/playerService.test.js) - ✅ 5/5 tests pasando
- [src/services/gameFlowService.test.js](src/services/gameFlowService.test.js) - ✅ 4/4 tests pasando
- [src/services/gameController.test.js](src/services/gameController.test.js) - ✅ 6/6 tests pasando

**Total:** 22/22 tests validados ✅

---

## 🔗 Integraciones Completadas

### Backend → API
```
playerService (validación) 
    ↓
playerPersistenceService → playersApi → db.json
```

### Deck → Battle
```
deckService (validación) 
    ↓
gameFlowService → battleService → gameController (salida a UI)
```

### Battle → Persistence
```
battleService (lógica) 
    ↓
gameFlowService → battlePersistenceService → battlesApi → db.json
```

### Complete Flow
```
gameController 
  ├─ initializeGameSession() → loadActiveCards() → cardsApi
  ├─ registerPlayerSession() → registerPlayer() → playersApi → db.json
  ├─ validateSelectedDeck() → validateDeckSelection()
  ├─ createCombatSession() → startCombat() → battleService
  ├─ performPlayerAction() / performMachineAction() → battleService
  └─ finishGameSession() → finishBattle() → playerPersistenceService + battlePersistenceService
```

---

## 📦 Tecnologías Utilizadas

- **Framework:** Vite 8.2.1
- **Lenguaje:** JavaScript ES6+ (Módulos)
- **API Local:** JSON Server (simulada con Fetch)
- **Testing:** Node.js built-in test runner
- **Build:** Vite (producción lista)

---

## 🚀 Cómo Ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```
Accede a: `http://localhost:5173`

### 3. Build de producción
```bash
npm run build
```
Salida: `dist/`

### 4. Ejecutar tests
```bash
npm run test
```

---

## 📋 Tareas Pendientes (Para Manuel)

### Fase 1: Componentes Base
- [ ] **Página de Login Admin**
  - Formulario con usuario/contraseña
  - Integración con `loginAdmin()` de API

- [ ] **Página de Registro de Jugador**
  - Formulario de nickname
  - Integración con `registerPlayerSession()`
  - Validación visual de errores

- [ ] **Página de Selección de Mazo**
  - Grid de cartas con imágenes
  - Selector de 5-10 cartas
  - Integración con `validateSelectedDeck()`

### Fase 2: Sistema de Batalla
- [ ] **Arena de Combate**
  - Visualización de cartas activas (jugador + máquina)
  - Botones de acciones: Atacar, Defender, Especial
  - Panel de log de batalla
  - Indicadores de HP y estado

- [ ] **Turnos y Animaciones**
  - Alternancia visual de turnos
  - Animaciones de daño
  - Efectos visuales de poderes especiales
  - Sonidos de batalla (opcional)

### Fase 3: Pantallas Complementarias
- [ ] **Panel de Resultados**
  - Ganador/Perdedor
  - Puntos ganados
  - Estadísticas actualizadas

- [ ] **Perfil de Jugador**
  - Nickname, wins, losses, puntos
  - Historial de últimas 5 partidas

- [ ] **Admin CRUD de Cartas**
  - Crear, editar, eliminar cartas
  - Visualización de catálogo
  - Toggle de activación

### Fase 4: Pulido
- [ ] **Diseño Responsivo**
  - Mobile, Tablet, Desktop
  - Adaptación de grid y botones

- [ ] **Tema Visual**
  - Paleta de colores
  - Tipografía consistente
  - Iconografía de cartas

- [ ] **Documentación de Componentes**
  - Guía de componentes reutilizables
  - Props y eventos
  - Ejemplos de uso

---

## 📊 Estado de Implementación

| Componente | Estado | Responsable | Notas |
|-----------|--------|-------------|-------|
| **Lógica de Juego** | ✅ Completo | José | Testeado, validado |
| **API y Persistencia** | ✅ Completo | José | Integrado con db.json |
| **Servicios** | ✅ Completo | José | Listos para UI |
| **Controller** | ✅ Completo | José | Interfaz limpia |
| **UI Componentes** | ⏳ Pendiente | Manuel | Esperando definición |
| **Estilos** | ⏳ Pendiente | Manuel | Base CSS mínimo |
| **Animaciones** | ⏳ Pendiente | Manuel | Opcional, post-MVP |
| **Admin Panel** | ⏳ Pendiente | Manuel | Baja prioridad |

---

## 🔄 Flujo de Integración Recomendado

1. **Iniciar con pantalla de Login**
   - Consumir `loginAdmin()` del gameController
   - Validar respuesta

2. **Implementar Registro de Jugador**
   - Consumir `registerPlayerSession(nickname)`
   - Capturar objeto player para sesión

3. **Armar Selector de Mazo**
   - Consumir `initializeGameSession()` para cargar cartas
   - Consumir `validateSelectedDeck(selectedCards)` al seleccionar

4. **Construir Arena de Batalla**
   - Consumir `createCombatSession(playerDeck, machineDeck)`
   - Usar `performPlayerAction()` y `performMachineAction()` para turnos
   - Monitorear `state.battleFinished` para detectar fin

5. **Pantalla de Resultados**
   - Consumir `finishGameSession()` para guardar resultado
   - Mostrar estadísticas actualizadas

---

## 🐛 Troubleshooting

### Error: "API URL undefined"
- Verificar que [.env.example](.env.example) esté presente
- Asegurar que `import.meta.env` funciona en el contexto (Vite)

### Tests fallan en Node
- Usar Node 18+ que soporta test runner nativo
- No requiere `jest` o `vitest`

### db.json no se actualiza
- Verificar permisos de archivo
- Confirmar que JSON Server está ejecutándose (en desarrollo)

### Cartas no cargan
- Revisar que seedCards esté poblado en db.json
- Verificar `cards` array en db.json no esté vacío

---

## 📞 Contacto

- **José:** Lógica, backend, tests
- **Manuel:** UI, UX, diseño

---

## 📄 Archivos de Referencia

- [Wireframes](wireframes-card-battle-arena-v2.md)
- [Data Contract](docs/data-contract.md)
- [Vite Config](vite.config.js)
- [Package Info](package.json)

---

**Última actualización:** 2026-08-18  
**Versión:** 0.1.0
