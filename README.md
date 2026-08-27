# Card Battle Arena

Juego web de combate por turnos con cartas Pokémon de la primera generación. Cada partida usa el mismo pool fijo de 20 cartas con recursos visuales locales; el jugador elige 5 y la máquina recibe otras 5 distintas del mismo pool.

## Integrantes

- Manuel — Frontend, UX, interfaz visual y experiencia de combate.
- José — Lógica de juego, persistencia, API y pruebas.

## Enlaces de entrega

- Frontend (Vercel): https://juego-cartas-js.vercel.app
- API (Railway): https://juegocartasjs-production.up.railway.app
- Repositorio: verificar el remoto configurado con `git remote -v`.

## Credenciales de administración

| Usuario | Contraseña |
| --- | --- |
| `admin` | `cards2026` |

El acceso está disponible desde el módulo **Admin**. Las credenciales se incluyen únicamente para la demostración académica con JSON Server; no son un esquema seguro para producción.

## Funcionalidades entregadas

- Registro y selección de perfil de jugador.
- Catálogo completo de 151 Pokémon de Kanto con imagen y grito.
- Pool fijo de 20 cartas activas con imágenes locales; validación de al menos 10 activas para poder formar ambos equipos.
- Selección y orden de 5 cartas, rival automático sin repetir cartas del jugador y combate por turnos 5v5.
- Ataques, defensa que reduce el siguiente daño, especial habilitado desde el segundo turno y cooldown de 3 turnos.
- Selector de batalla manual o automática; el modo automático ejecuta ambos participantes con pausas mediante `setTimeout()` y deshabilita los controles manuales.
- Golpes críticos con 12% de probabilidad y multiplicador ×1.5, además de esquives con 8% de probabilidad y daño 0.
- Relevo automático hasta que los cinco Pokémon de un equipo sean derrotados.
- Barra de vida, defensa activa, estado del especial, animaciones de ataque/defensa/KO y sonidos locales más gritos de Pokémon.
- Resultado persistido con el modo jugado, puntos, historial desde `/battles` y ranking ordenado con podio visual para los tres primeros lugares.
- Administración de cartas con login y operaciones REST visibles: GET, POST, PUT, PATCH y DELETE; la eliminación se confirma dentro de la interfaz.

## Ejecutar localmente

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run api
```

En otra terminal:

```bash
npm run dev
```

Abre `http://localhost:5173`.

Comandos útiles:

```bash
npm test                # pruebas con Node test runner
npm run build           # build de producción
npm run preview         # revisa el build localmente
npm run generate:sounds # regenera los efectos WAV locales
npm run seed            # genera/actualiza los datos de cartas
```

## Variables de entorno

Crear un `.env` para desarrollo si se requiere otra API:

```env
VITE_API_DEV_URL=http://localhost:3000
```

En Vercel configurar:

```env
VITE_API_URL=https://juegocartasjs-production.up.railway.app
```

En Railway configurar, si se cambia el dominio del frontend:

```env
CORS_ORIGINS=https://juego-cartas-js.vercel.app,http://localhost:5173
```

## Estructura

```text
src/
├── api/          # llamadas Fetch a cards, players, admins y battles
├── components/   # Web Components: registro, pool, equipo, arena, admin, historial y ranking
├── services/     # reglas de combate, flujo, persistencia y audio
├── styles/       # tema retro, estados, responsive y animaciones
└── data/         # datos de apoyo y seed
public/assets/
├── audio/        # efectos de combate WAV
└── images/       # recursos visuales del juego
server.js         # JSON Server, CORS y API local/Railway
src/data/db.json  # única base de datos de ejecución
```

## Contrato de API

| Recurso | Operaciones usadas |
| --- | --- |
| `/cards` | GET, GET por id, POST, PUT, PATCH, DELETE |
| `/admins` | GET filtrado para login de demostración |
| `/players` | GET, POST y PUT de estadísticas |
| `/battles` | GET y POST de historial |

## Verificación antes de entregar

```bash
npm test
npm run build
git status
git rev-parse HEAD
```

El último comando devuelve el hash final que debe pegarse en la entrega después de crear el commit definitivo. No lo escribas manualmente: el hash debe corresponder exactamente al commit publicado.
