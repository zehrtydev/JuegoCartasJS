const previewViews = new Set([
  'home',
  'pool',
  'team',
  'arena',
  'history',
  'leaderboard',
  'admin',
])

export const previewPlayers = [
  { id: 'preview-manuel', alias: 'MANUEL', points: 420 },
  { id: 'preview-misty', alias: 'MISTY', points: 260 },
]

export const previewCards = [
  ['001', 'Bulbasaur', 'Planta', 250], ['004', 'Charmander', 'Fuego', 250], ['007', 'Squirtle', 'Agua', 250], ['025', 'Pikachu', 'Eléctrico', 250], ['027', 'Sandshrew', 'Tierra', 250],
  ['035', 'Clefairy', 'Hada', 250], ['037', 'Vulpix', 'Fuego', 250], ['041', 'Zubat', 'Volador', 250], ['052', 'Meowth', 'Normal', 250], ['058', 'Growlithe', 'Fuego', 250],
  ['066', 'Machop', 'Lucha', 250], ['074', 'Geodude', 'Roca', 250], ['081', 'Magnemite', 'Eléctrico', 250], ['092', 'Gastly', 'Fantasma', 250], ['095', 'Onix', 'Roca', 250],
  ['104', 'Cubone', 'Tierra', 250], ['113', 'Chansey', 'Normal', 250], ['123', 'Scyther', 'Bicho', 250], ['131', 'Lapras', 'Hielo', 250], ['147', 'Dratini', 'Dragón', 250],
].map(([id, name, type, hp]) => ({ id: `preview-${id}`, number: id, name, type, hp, sprite: type }))

/**
 * Habilita pantallas revisables sin API solamente durante `npm run dev`.
 * En builds de producción el parámetro `preview` se ignora por completo.
 */
export function getPreviewMode() {
  if (!import.meta.env.DEV) {
    return { active: false, view: 'home' }
  }

  const requestedView = new URLSearchParams(window.location.search).get('preview')

  if (!previewViews.has(requestedView)) {
    return { active: false, view: 'home' }
  }

  return { active: true, view: requestedView }
}

export function getPreviewUrl(view) {
  const url = new URL(window.location.href)
  url.searchParams.set('preview', view)
  url.hash = ''
  return `${url.pathname}${url.search}`
}
