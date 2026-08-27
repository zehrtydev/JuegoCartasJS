# Plan de implementación — Examen Card Battle Arena

**Fuente:** `docs/examen.md`  
**Base revisada:** rama `main`, commit actual `451020e`  
**Tiempo disponible:** 3 horas  
**Objetivo:** extender el combate existente con modo manual/automático, acciones automáticas, golpes críticos, esquives y persistencia del modo de juego.

## 1. Estado actual y alcance

El proyecto ya cuenta con:

- motor de turnos en `src/services/battleService.js`;
- controlador de alto nivel en `src/services/gameController.js`;
- turno de máquina diferido mediante `setTimeout()` en `src/components/app/gameApp.js`;
- relevos automáticos después de un KO;
- especial con desbloqueo, usos y cooldown;
- persistencia de partidas y puntos mediante `finishGameSession()`;
- pruebas unitarias del motor, controlador y persistencia.

Todavía falta implementar:

1. selector de modo Manual/Automático;
2. bucle automático controlado por temporizadores cancelables;
3. selección de acciones válidas para cualquier participante automático;
4. crítico del 12% y esquive del 8%;
5. eventos visuales diferenciados para crítico y esquive;
6. campo `mode` en el historial;
7. pruebas específicas del examen.

También existe una falla previa que debe corregirse antes de cerrar el examen: `applyAttack()` actualmente causa daño aleatorio de 1–10 cuando el multiplicador de tipo es `0`. La regla del examen exige que una inmunidad termine con daño `0`.

## 2. Diseño técnico acordado

### 2.1 Modo de batalla

Usar un único estado de modo en `GameApp`:

```js
const BATTLE_MODES = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
};
```

El modo se selecciona antes o al iniciar la arena y se conserva durante toda la partida. El estado de batalla no debe depender del DOM; el componente solo informa el cambio mediante un evento, por ejemplo `battle-mode-changed`.

En modo `manual`:

- el jugador usa los botones actuales;
- la máquina continúa usando su turno diferido actual.

En modo `automatic`:

- los controles manuales quedan deshabilitados y muestran el modo activo;
- jugador y máquina usan el mismo flujo de ejecución de acciones;
- cada turno automático se ejecuta con un `setTimeout()` y una pausa visual configurable;
- no se usa `setInterval()` ni recursión sin condición;
- al finalizar la batalla se limpian todos los temporizadores;
- no se programa otro turno cuando `battleFinished === true`.

### 2.2 Contrato de acciones automáticas

Agregar en `src/services/battleService.js` una función pura, preferiblemente:

```js
getAvailableActions(card, opponentCard)
```

Debe devolver identificadores de acciones válidas:

- `attack-1`, `attack-2`, etc., solo si quedan usos;
- `defend`, siempre disponible;
- `special`, solo si tiene usos, está desbloqueado y `specialCooldown === 0`.

La estrategia puede ser sencilla y determinista para explicar en la sustentación:

1. construir la lista válida;
2. priorizar `special` si está disponible y el oponente tiene vida alta;
3. usar `defend` si la vida propia está por debajo de 35%, con una probabilidad sencilla;
4. elegir un ataque válido como fallback;
5. nunca devolver una acción bloqueada.

`chooseMachineAction()` debe reutilizar esta función. El modo automático del jugador debe llamar al mismo selector o a una variante `chooseAutomaticAction()` para que ambos participantes respeten las mismas validaciones.

### 2.3 Resolución exacta del daño

Centralizar la resolución de ataques en una función común para ataque normal y especial. El orden debe ser exactamente:

1. seleccionar ataque;
2. calcular daño base con el factor aleatorio existente;
3. comprobar esquive (`Math.random() < 0.08`);
4. si esquiva: daño `0`, mensaje `¡ATAQUE ESQUIVADO!`, sin crítico ni defensa;
5. comprobar crítico (`Math.random() < 0.12`);
6. aplicar multiplicador crítico `×1.5`;
7. aplicar reducción de defensa del 50%;
8. redondear el daño final;
9. restar HP con `Math.max(0, hp - damage)`;
10. devolver eventos y mensajes para la interfaz;
11. verificar KO y relevo.

Para una inmunidad de tipo, el daño debe ser `0`; no debe generarse daño residual. El resultado debe incluir datos explícitos, no obligar a la interfaz a deducirlos:

```js
{
  damage,
  isCritical,
  dodged,
  multiplier,
  finished,
  message,
  success
}
```

El especial debe pasar por la misma resolución: puede esquivarse, puede ser crítico y puede reducirse por defensa.

## 3. Archivos previstos

| Archivo | Cambio |
|---|---|
| `src/services/battleService.js` | Acciones válidas, resolución común de daño, crítico, esquive y resultados enriquecidos. |
| `src/services/gameController.js` | Exponer acción automática y propagar eventos de crítico/esquive sin duplicar reglas. |
| `src/components/app/gameApp.js` | Estado del modo, orquestación automática con `setTimeout()`, cancelación y persistencia de `mode`. |
| `src/components/battle/battleArena.js` | Selector Manual/Automático, botones deshabilitados y feedback visual/mensaje de eventos. |
| `src/styles/main.css` | Clases visuales para crítico y esquive, solo si las existentes no alcanzan. |
| `src/services/battlePersistenceService.js` | Aceptar y conservar `mode` en el registro de partida. |
| `src/components/history/matchHistory.js` | Mostrar el modo guardado. |
| `src/utils/battleEngine.test.js` | Pruebas aisladas de probabilidades con `Math.random` controlado, si se deja allí la función común. |
| `src/services/battleService.test.js` | Pruebas del orden de resolución y especial. |
| `src/services/gameController.test.js` | Pruebas de acciones automáticas, KO, relevo y finalización. |
| `README.md` | Documentar cómo ejecutar y probar las funcionalidades del examen. |

No modificar `db.json` manualmente para simular resultados. La partida final debe guardar el modo mediante el flujo normal de persistencia.

## 4. Orden de implementación para las 3 horas

### Fase 0 — Línea base y preparación (10 min)

- Confirmar el commit de partida solicitado por el examen.
- Crear la rama `exam/ApellidoNombre` con el formato real del estudiante.
- Ejecutar `npm test` y registrar las fallas actuales.
- No perder tiempo corrigiendo problemas visuales ajenos al alcance.

**Salida:** rama creada, línea base conocida y lista de archivos confirmada.

### Fase 1 — Motor de combate (55 min)

- Corregir inmunidad para devolver daño `0`.
- Crear una resolución común para ataque y especial.
- Añadir esquive 8% y crítico 12% en el orden exigido.
- Añadir `isCritical`, `dodged` y mensajes al resultado.
- Mantener usos, cooldown, defensa, HP, KO y relevo existentes.
- Crear pruebas deterministas para:
  - daño normal;
  - crítico `×1.5`;
  - esquive con daño `0`;
  - crítico no aplicado cuando hubo esquive;
  - defensa después del crítico;
  - especial esquivable y crítico;
  - especial bloqueado por turno/cooldown;
  - inmunidad con daño `0`.

**Salida:** el motor cumple las reglas sin depender de la interfaz.

### Fase 2 — Acciones automáticas y flujo de turnos (45 min)

- Implementar `getAvailableActions()`.
- Hacer que la máquina reutilice la lista de acciones válidas.
- Añadir `performAutomaticAction(state, actor)` o una interfaz equivalente.
- Reutilizar `performPlayerAction()`/`performMachineAction()` para evitar dos motores distintos.
- Mantener el relevo automático ya existente.
- Crear pruebas de que el especial bloqueado nunca aparece y de que siempre se devuelve una acción válida.

**Salida:** cualquier participante automático puede ejecutar un turno legal.

### Fase 3 — Selector e integración de modo (35 min)

- Añadir selector accesible Manual/Automático en `battleArena.js`.
- Guardar el modo en `GameApp` al iniciar la batalla.
- En manual, conservar controles y turno de máquina actual.
- En automático, programar cada turno con un `setTimeout()` controlado.
- Renderizar después de cada acción para mostrar pausa, crítico, esquive y relevo.
- Deshabilitar controles manuales mientras el modo automático esté activo.
- Evitar duplicación de timers con una única referencia o colección de timers.

**Salida:** una batalla completa puede ejecutarse automáticamente y detenerse al terminar.

### Fase 4 — Persistencia, feedback y cierre (25 min)

- Pasar `mode: 'manual' | 'automatic'` a `finishGameSession()`.
- Guardarlo en `saveBattleRecord()`.
- Mostrarlo en `match-history`.
- Añadir mensajes exactos `¡GOLPE CRÍTICO!` y `¡ATAQUE ESQUIVADO!`.
- Agregar clases diferenciadas, por ejemplo `battleCard--critical` y `battleCard--dodged`.
- Limpiar temporizadores en `disconnectedCallback()` y al finalizar.
- Actualizar README con ejecución, pruebas y resumen.

**Salida:** historial correcto, feedback visible y aplicación ejecutable.

### Fase 5 — Verificación final (10 min)

Ejecutar:

```powershell
npm test
npm run build
```

Después probar manualmente:

1. batalla manual normal;
2. batalla automática completa;
3. especial bloqueado y luego desbloqueado;
4. crítico forzado con `Math.random = () => 0.10`;
5. esquive forzado con `Math.random = () => 0.05`;
6. KO y entrada de la siguiente carta;
7. finalización sin acciones posteriores;
8. historial con `mode: "automatic"`.

## 5. Criterios de aceptación

- El selector permite cambiar entre Manual y Automático y el valor queda visible.
- En automático no se puede ejecutar una acción mediante los botones manuales.
- No existe `setInterval()` ni un ciclo infinito.
- Cada participante automático solo elige acciones válidas.
- El especial no aparece antes de su turno de desbloqueo ni durante cooldown.
- El crítico ocurre con probabilidad configurable de 12% y multiplica por 1.5.
- El esquive ocurre con probabilidad configurable de 8% y deja el daño en 0.
- Si ocurre esquive, no se aplica crítico ni reducción de defensa.
- Si no ocurre esquive, se conserva el orden crítico → defensa → redondeo.
- Los mensajes de crítico y esquive tienen feedback visual diferente.
- El KO activa el siguiente Pokémon vivo automáticamente.
- La batalla se detiene al no quedar cartas vivas y no deja temporizadores activos.
- Victoria y derrota actualizan puntos, jugador, partida e historial.
- El registro contiene `mode: "manual"` o `mode: "automatic"`.
- `npm test` y `npm run build` terminan correctamente.

## 6. Riesgos y decisiones de alcance

1. **Tres horas es un límite estricto.** No incluir nuevas animaciones complejas, cambios de diseño general ni nuevas reglas de cartas.
2. **No duplicar el motor.** El modo automático debe orquestar las funciones existentes y compartir la resolución de acciones.
3. **Aleatoriedad difícil de probar.** Mantener las probabilidades en constantes o permitir inyectar un generador aleatorio en pruebas.
4. **Persistencia parcial.** Si actualizar estadísticas o guardar la batalla falla, mostrar el resultado como no persistido y no ocultar el error.
5. **Estado de temporizadores.** El temporizador es responsabilidad de `GameApp`; el componente `battleArena` no debe crear temporizadores de batalla.
6. **Base actual.** Antes de declarar terminado el examen, hay que resolver la prueba de inmunidad actualmente fallida y comprobar si las pruebas antiguas siguen siendo compatibles con el nuevo orden de resolución.

## 7. Guion breve de sustentación

- **Modo:** explicar que `GameApp` decide quién actúa y controla el `setTimeout()` cancelable.
- **Acciones válidas:** mostrar `getAvailableActions()` y cómo filtra usos, desbloqueo y cooldown.
- **Crítico:** señalar la constante/probabilidad `0.12` y el multiplicador `1.5`.
- **Esquive:** señalar la comprobación `0.08` antes del crítico.
- **Turno:** mostrar `currentTurn` y la transición después de cada acción.
- **Detención:** mostrar la condición `battleFinished` y la limpieza de timers.
- **Persistencia:** mostrar dónde `mode` viaja desde la arena hasta el registro de `battles`.
