# Identidad visual — Card Battle Arena

**Estado:** dirección visual aprobada para la interfaz del proyecto.  
**Referencia:** híbrido de arena de torneo y arcade retro de Kanto, sin copiar pantallas ni logotipos oficiales.

## 1. Intención

La aplicación debe sentirse como la mesa de un torneo nocturno de cartas: clara para jugar, competitiva y con detalles retro contenidos. La identidad no busca simular un emulador ni una pantalla de marketing; prioriza el tablero, las cartas y las acciones del jugador.

## 2. Paleta: Obsidiana + oro

| Uso | Token | Color |
|---|---|---|
| Fondo principal | `arena` | `#14130F` |
| Fondo profundo | `arenaDeep` | `#0B0A08` |
| Superficie | `surface` | `#24221C` |
| Panel secundario | `panel` | `#302D24` |
| Bordes | `brass` | `#9B7A32` |
| Acción principal | `action` | `#F6C945` |
| Texto principal | `cream` | `#FFF6D8` |
| Texto secundario | `muted` | `#C7BFA8` |
| Éxito | `success` | `#78A65A` |
| Peligro/acento | `danger` | `#C94A3E` |
| Defensa | `defense` | `#718092` |

El azul no forma parte de fondos ni paneles. Solo puede comunicar una acción o estado de defensa junto con texto e icono.

## 3. Componentes y composición

- Los paneles usan bordes rectos con un marco pixelado discreto, no tarjetas redondeadas genéricas.
- Las acciones principales son amarillas, con contraste alto y una sombra corta que responde al pulsarlas.
- Las etiquetas de estado usan una fuente monoespaciada, mayúsculas y espaciado entre letras; los títulos pueden ser más grandes, pero no deben convertir la interfaz en una hero page.
- El tablero de cinco espacios de carta es una referencia visual constante cuando ayude a orientar al jugador; no debe presentar cartas ficticias como datos reales.
- Los reversos de carta vacíos usan un patrón propio y un emblema de captura estilizado. El encabezado y los separadores pueden incorporar focos de estadio y un retrato genérico de entrenador hechos con CSS. Son ornamentos de la interfaz, no recursos oficiales ni sustitutos de los sprites locales.
- En móvil, los controles conservan objetivos táctiles claros y los paneles se apilan sin perder la jerarquía.

## 4. Accesibilidad

- El color nunca es la única forma de comunicar selección, daño, defensa, éxito o error.
- Todo control interactivo tiene foco visible de alto contraste.
- Las etiquetas, valores y botones deben seguir siendo legibles sin la textura de fondo.
- No se usarán animaciones decorativas que retrasen la interacción; una animación solo debe explicar un cambio de estado.

## 5. Límites

- No usar fondos azules, degradados púrpura, glassmorphism ni bloques genéricos de tipo SaaS.
- No copiar interfaces, logotipos, tipografías o recursos oficiales de Pokémon.
- Las ilustraciones y recursos definitivos deben tener licencia o procedencia apta para la entrega.
