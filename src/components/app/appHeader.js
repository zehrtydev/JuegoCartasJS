const navigationItems = [
  { id: 'home', label: 'Inicio' },
  { id: 'history', label: 'Historial' },
  { id: 'leaderboard', label: 'Ranking' },
]

class AppHeader extends HTMLElement {
  #activeView = 'home'

  connectedCallback() {
    this.#activeView = this.getAttribute('active-view') || 'home'
    this.#render()
  }

  #render() {
    const isHome = this.#activeView === 'home'

    this.innerHTML = `
      <header class="gameHeader ${isHome ? 'gameHeader--home' : 'gameHeader--inner'}">
        <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 ${isHome ? 'gameHeader__homeInner' : 'py-3 lg:flex-row lg:justify-between'}">
          <a class="gameMarquee flex items-center gap-3 px-5 ${isHome ? 'gameMarquee--home' : 'py-3'} focus:outline-none focus:ring-4 focus:ring-action" href="#home" data-view="home" aria-label="Ir al inicio de Card Battle Arena">
            <span class="gameMarquee__seal captureSeal hidden sm:block" aria-hidden="true"></span>
            <span>
              <span class="gameMarquee__title block text-2xl font-black tracking-[0.08em] text-action ${isHome ? 'sm:text-5xl' : 'sm:text-4xl'}">CARD BATTLE ARENA</span>
              <span class="block text-center font-mono text-[0.62rem] font-black tracking-[0.28em] text-cream">TORNEO KANTO · GEN 1</span>
            </span>
            <span class="gameMarquee__seal captureSeal hidden sm:block" aria-hidden="true"></span>
          </a>
          ${isHome ? '' : `<nav aria-label="Navegación principal">
            <ul class="flex flex-wrap gap-2">
              ${navigationItems.map(({ id, label }) => `
                <li><a class="gameNavLink px-4 py-3 font-mono text-xs font-black tracking-wider focus:outline-none focus:ring-4 focus:ring-action ${this.#activeView === id ? 'gameNavLink--active' : ''}" href="#${id}" data-view="${id}" ${this.#activeView === id ? 'aria-current="page"' : ''}>${label}</a></li>
              `).join('')}
            </ul>
          </nav>`}
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
