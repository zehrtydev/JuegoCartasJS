import './components/app/appHeader.js'
import './components/app/gameApp.js'
import './components/auth/playerRegister.js'
import './components/battle/battleArena.js'
import './components/cards/poolGrid.js'
import './components/deck/teamBuilder.js'
import './components/history/matchHistory.js'
import './components/leaderboard/leaderboardView.js'
import './components/ui/uiState.js'

/**
 * Monta el componente raíz. La navegación y la sesión temporal viven dentro
 * de game-app; las integraciones con la API se conectarán desde los servicios.
 */
export function renderApp(root) {
  root.replaceChildren(document.createElement('game-app'))
}
