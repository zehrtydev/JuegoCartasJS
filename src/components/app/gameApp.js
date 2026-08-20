import { getPreviewMode, previewCards, previewPlayers } from './previewMode.js'
import {
  initializeGameSession,
  registerPlayerSession,
  createCombatSession,
  performPlayerAction,
  performMachineAction,
  finishGameSession
} from '../../services/gameController.js'
import { getPlayers } from '../../api/playersApi.js'

const viewLabels = {
  home: 'Inicio',
  pool: 'Elige tu equipo',
  team: 'Construye tu equipo',
  arena: 'Arena de batalla',
  result: 'Resultado',
  history: 'Historial',
  leaderboard: 'Ranking',
}

class GameApp extends HTMLElement {
  #preview = getPreviewMode()
  #currentView = this.#preview.view
  
  #currentPlayer = null
  #availableCards = []
  #playersList = []
  #playerDeck = []
  #battleState = null
  #machineTurnTimer = null

  async connectedCallback() {
    this.addEventListener('navigate', this.#handleNavigation)
    this.addEventListener('register-player', this.#handleRegisterPlayer)
    this.addEventListener('select-player', this.#handleSelectPlayer)
    this.addEventListener('team-selection-confirmed', this.#handleTeamSelection)
    this.addEventListener('battle-action', this.#handleBattleAction)
    
    await this.#loadInitialData()
    this.#render()
  }

  disconnectedCallback() {
    this.removeEventListener('navigate', this.#handleNavigation)
    this.removeEventListener('register-player', this.#handleRegisterPlayer)
    this.removeEventListener('select-player', this.#handleSelectPlayer)
    this.removeEventListener('team-selection-confirmed', this.#handleTeamSelection)
    this.removeEventListener('battle-action', this.#handleBattleAction)
    clearTimeout(this.#machineTurnTimer)
  }

  async #loadInitialData() {
    if (this.#preview.active) {
      this.#playersList = previewPlayers
      this.#availableCards = previewCards
    } else {
      try {
        this.#playersList = await getPlayers() || []
      } catch (err) {
        console.error('Error loading players:', err)
        this.#playersList = []
      }
    }
  }

  async #loadCardsSession() {
    if (!this.#preview.active && this.#availableCards.length === 0) {
      const session = await initializeGameSession()
      if (session.success) {
        this.#availableCards = session.cards
      }
    }
  }

  #handleNavigation = (event) => {
    this.#currentView = event.detail.view
    this.#render()
  }

  #handleRegisterPlayer = async (event) => {
    const { alias } = event.detail
    
    if (this.#preview.active) {
      this.#currentPlayer = { id: 'preview-1', alias, points: 0 }
      this.#currentView = 'pool'
      this.#render()
      return
    }

    const result = await registerPlayerSession(alias)
    if (result.success) {
      this.#currentPlayer = result.player
      this.#currentView = 'pool'
      await this.#loadCardsSession()
      this.#render()
    } else {
      alert(result.message)
    }
  }

  #handleSelectPlayer = async (event) => {
    this.#currentPlayer = event.detail.player
    this.#currentView = 'pool'
    if (!this.#preview.active) {
      await this.#loadCardsSession()
    }
    this.#render()
  }

  #handleTeamSelection = async (event) => {
    const { selectedCards } = event.detail
    this.#playerDeck = selectedCards
    
    if (this.#preview.active) {
      this.#currentView = 'arena'
      this.#render()
      return
    }

    const combat = await createCombatSession(this.#playerDeck)
    if (combat.success) {
      this.#battleState = combat.state
      this.#currentView = 'arena'
      this.#render()
      this.#scheduleMachineTurn()
    } else {
      alert(combat.message || 'Error al iniciar el combate')
    }
  }

  #handleBattleAction = async (event) => {
    const { action, attackId } = event.detail
    const result = performPlayerAction(this.#battleState, action, attackId)
    if (result.success) {
      this.#battleState = result.state
      this.#render()
      this.#scheduleMachineTurn()
    } else {
      alert(result.message)
    }
  }

  #scheduleMachineTurn() {
    if (
      !this.#battleState ||
      this.#battleState.battleFinished ||
      this.#battleState.currentTurn !== 'machine' ||
      this.#machineTurnTimer !== null
    ) {
      return
    }

    this.#machineTurnTimer = setTimeout(() => {
      this.#machineTurnTimer = null

      if (!this.#battleState || this.#battleState.battleFinished || this.#battleState.currentTurn !== 'machine') {
        return
      }

      const machineResult = performMachineAction(this.#battleState)
      if (machineResult.success) {
        this.#battleState = machineResult.state
        this.#render()
      }
    }, 1000)
  }

  #render() {
    this.replaceChildren()

    const header = document.createElement('app-header')
    header.setAttribute('active-view', this.#currentView)
    header.setAttribute('preview', String(this.#preview.active))
    this.append(header)

    const main = document.createElement('main')
    main.className = 'gameMain'

    main.append(this.#createView())
    this.append(main)

    this.append(document.createElement('app-footer'))
  }

  #createView() {
    if (this.#currentView === 'home') {
      const register = document.createElement('player-register')
      register.players = this.#playersList
      return register
    }

    if (this.#currentView === 'pool') {
      const pool = document.createElement('pool-grid')
      pool.cards = this.#availableCards
      return pool
    }

    if (this.#currentView === 'team') {
      const teamBuilder = document.createElement('team-builder')
      teamBuilder.cards = []
      return teamBuilder
    }

    if (this.#currentView === 'arena') {
      const arena = document.createElement('battle-arena')
      arena.battle = this.#battleState
      return arena
    }

    if (this.#currentView === 'history') {
      const history = document.createElement('match-history')
      history.records = []
      return history
    }

    if (this.#currentView === 'leaderboard') {
      const leaderboard = document.createElement('leaderboard-view')
      leaderboard.players = []
      return leaderboard
    }

    const section = document.createElement('section')
    section.className = 'pixelFrame mx-auto max-w-2xl bg-surface p-8 text-center sm:p-12'
    section.innerHTML = `
      <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">CARD BATTLE ARENA</p>
      <h1 class="mt-3 text-3xl font-black text-cream sm:text-4xl">${viewLabels[this.#currentView] || 'Pantalla no disponible'}</h1>
      <p class="mt-4 text-muted">Esta vista ya forma parte de la navegación. Su contenido funcional se implementará en su bloque correspondiente.</p>
      <button class="pixelButton mt-8 bg-action px-5 py-3 font-mono text-sm font-black tracking-wide text-arena-deep transition hover:bg-[#ffda68] focus:outline-none focus:ring-2 focus:ring-cream focus:ring-offset-2 focus:ring-offset-surface" type="button" data-view="home">VOLVER AL INICIO</button>
    `
    section.querySelector('[data-view]').addEventListener('click', () => {
      this.#currentView = 'home'
      this.#render()
    })
    return section
  }
}

customElements.define('game-app', GameApp)
