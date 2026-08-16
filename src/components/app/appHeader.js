const navigationItems = [
  { id: 'home', label: 'Inicio' },
  { id: 'pool', label: 'Pool', unlockMessage: 'Registra o elige un entrenador para desbloquear el pool.' },
  { id: 'team', label: 'Equipo', unlockMessage: 'Selecciona cinco cartas para construir tu equipo.' },
  { id: 'arena', label: 'Arena', unlockMessage: 'Confirma tu equipo para entrar a la arena.' },
  { id: 'result', label: 'Resultado', unlockMessage: 'Termina un combate para consultar el resultado.' },
  { id: 'history', label: 'Historial' },
  { id: 'leaderboard', label: 'Ranking' },
]

class AppHeader extends HTMLElement {
  #activeView = 'home'
  #preview = false

  connectedCallback() {
    this.#activeView = this.getAttribute('active-view') || 'home'
    this.#preview = this.getAttribute('preview') === 'true'
    this.#render()
  }

  #canNavigateTo(view) {
    if (this.#preview) return true
    return ['home', 'history', 'leaderboard'].includes(view)
  }

  #renderNavigationItem({ id, label, unlockMessage }) {
    const isAvailable = this.#canNavigateTo(id)
    const isActive = this.#activeView === id

    if (!isAvailable) {
      return `<li><span class="gameNavLink gameNavLink--locked px-3 py-2 font-mono text-[0.68rem] font-black tracking-wider" aria-disabled="true" title="${unlockMessage}">${label}</span></li>`
    }

    return `<li><a class="gameNavLink px-3 py-2 font-mono text-[0.68rem] font-black tracking-wider focus:outline-none focus:ring-4 focus:ring-action ${isActive ? 'gameNavLink--active' : ''}" href="#${id}" data-view="${id}" ${isActive ? 'aria-current="page"' : ''}>${label}</a></li>`
  }

  #render() {
    this.innerHTML = `
      <header class="gameHeader">
        <div class="gameTopBar">
          <a class="gameMarquee flex items-center gap-3 px-5 py-3 focus:outline-none focus:ring-4 focus:ring-action" href="#home" data-view="home" aria-label="Ir al inicio de Card Battle Arena">
            <span class="gameMarquee__seal captureSeal hidden sm:block" aria-hidden="true"></span>
            <span>
              <span class="gameMarquee__title block text-2xl font-black tracking-[0.08em] text-action sm:text-4xl">CARD BATTLE ARENA</span>
              <span class="block text-center font-mono text-[0.62rem] font-black tracking-[0.28em] text-cream">TORNEO KANTO · GEN 1</span>
            </span>
            <span class="gameMarquee__seal captureSeal hidden sm:block" aria-hidden="true"></span>
          </a>
          <div class="gameTopBar__navigation">
            ${this.#preview ? '<p class="gameTopBar__preview">PREVISUALIZACIÓN · SIN API</p>' : ''}
            <nav aria-label="Módulos de Card Battle Arena">
              <ul class="flex flex-wrap justify-center gap-2">
                ${navigationItems.map((item) => this.#renderNavigationItem(item)).join('')}
              </ul>
            </nav>
          </div>
        </div>
      </header>
    `

    this.querySelectorAll('[data-view]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        this.dispatchEvent(new CustomEvent('navigate', {
          bubbles: true,
          detail: { view: link.dataset.view },
        }))
      })
    })
  }
}

customElements.define('app-header', AppHeader)
