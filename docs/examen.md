# Examen - Card Battle Arena

## Información General

| Campo | Valor |
|-------|-------|
| **Tipo** | Prueba práctica individual |
| **Tiempo** | 3 horas |
| **Proyecto base** | Card Battle Arena (previamente desarrollado en parejas) |
| **Objetivo** | Demostrar dominio técnico extendiendo el motor de batalla existente |

---

## Punto de Partida

- Crear rama `exam/ApellidoNombre` desde el hash del último commit entregado
- **Stack permitido:** JavaScript Vanilla, Web Components, Fetch API, JSON Server, HTML, CSS, Vite
- **Prohibido:** React, Angular, Vue, Svelte u otro framework

---

## Funcionalidades a Implementar

### 1. Modo de Batalla Automática

- Implementar selector **Manual / Automático** en la interfaz
- En modo automático, las acciones del jugador se controlan mediante un script
- Usar `setTimeout()` o Promesas para pausas visuales entre turnos
- **NO** usar `setInterval` ni ciclos infinitos
- Deshabilitar botones manuales cuando el modo automático esté activo
- Cuando una carta sea derrotada, ingresar automáticamente la siguiente
- La batalla debe detenerse al finalizar la partida

### 2. Selección Automática de Acciones

En modo automático, cada participante construye una lista de acciones válidas:

```javascript
const availableActions = [...attacks, defense];

if (specialUnlocked && cooldown === 0) {
  availableActions.push(special);
}
```

La estrategia puede ser:
- Aleatoria
- Con reglas sencillas (ej: defenderse si la vida es baja, priorizar especial cuando esté disponible)

### 3. Golpe Crítico

| Parámetro | Valor |
|-----------|-------|
| Probabilidad | 12% |
| Multiplicador | ×1.5 |

```javascript
const isCritical = Math.random() < 0.12;
```

**Ejemplo:**
- Ataque normal: 40 puntos
- Con crítico: 40 × 1.5 = 60 puntos

**Requisito:** Mostrar mensaje "¡GOLPE CRÍTICO!" con feedback visual diferenciado.

### 4. Esquivar Ataque

| Parámetro | Valor |
|-----------|-------|
| Probabilidad | 8% |
| Daño recibido | 0 |

```javascript
const dodged = Math.random() < 0.08;
```

**Requisito:** Mostrar mensaje "¡ATAQUE ESQUIVADO!" con feedback visual diferenciado.

---

## Orden de Resolución de Eventos

Cada ataque debe resolverse en este orden exacto:

```
1. Seleccionar ataque
2. Calcular factor aleatorio de daño
3. ¿El defensor esquiva?
   → SÍ: daño final = 0, termina la resolución
   → NO: continúa
4. ¿Es golpe crítico?
   → SÍ: daño × 1.5
5. ¿El defensor estaba defendiendo?
   → SÍ: aplicar reducción del 50%
6. Redondear daño final
7. Restar HP (currentHp = Math.max(0, currentHp - damage))
8. Actualizar interfaz
9. Verificar si la carta fue derrotada
```

---

## Integración con Motor Existente

El poder especial debe funcionar correctamente:
- Desbloquearse en el turno correspondiente
- Cooldown funcionando correctamente
- Modo automático no puede usar el especial cuando esté bloqueado
- Un especial puede ser esquivado
- Un especial puede producir golpe crítico
- La defensa continúe reduciendo daño cuando corresponda

---

## Finalización y Persistencia

Al terminar la partida:
- Determinar victoria o derrota
- Asignar puntos correspondientes
- Actualizar el jugador
- Almacenar la partida
- Actualizar el leaderboard
- Detener temporizadores pendientes
- Guardar modo en el historial:

```json
{
  "mode": "automatic"
}
```

---

## Entregables

| Entregable | Descripción |
|------------|-------------|
| Repositorio | Enlace o rama utilizada |
| Commit | Hash del último commit dentro del tiempo |
| Archivos | Lista clara de archivos modificados |
| App | Aplicación ejecutable |
| README | Actualización con funcionalidades agregadas |

---

## Puntos de Sustentación

El docente podrá solicitar:
- Explicar una función específica
- Modificar una probabilidad o multiplicador
- Explicar un temporizador
- Identificar cómo se controla el turno
- Mostrar dónde se determina el golpe crítico
- Mostrar dónde se resuelve el esquive
- Explicar cómo se detiene la batalla automática
