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
    this.innerHTML = `
      <header class="border-b-2 border-brass bg-arena-deep/95">
        <div class="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a class="flex w-fit items-center gap-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-action" href="#home" data-view="home" aria-label="Ir al inicio de Card Battle Arena">
            <span class="captureSeal" aria-hidden="true"></span>
            <span>
              <span class="block font-mono text-[0.68rem] font-bold tracking-[0.25em] text-action">TORNEO KANTO · GEN 1</span>
              <span class="block text-xl font-black tracking-[0.08em] text-cream">CARD BATTLE ARENA</span>
            </span>
          </a>
          <nav aria-label="Navegación principal">
            <ul class="flex flex-wrap gap-2">
              ${navigationItems.map(({ id, label }) => `
                <li><a class="border border-transparent px-3 py-2 font-mono text-xs font-bold tracking-wider transition hover:border-brass hover:bg-surface focus:outline-none focus:ring-2 focus:ring-action ${this.#activeView === id ? 'border-brass bg-surface text-action' : 'text-muted'}" href="#${id}" data-view="${id}" ${this.#activeView === id ? 'aria-current="page"' : ''}>${label}</a></li>
              `).join('')}
            </ul>
          </nav>
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
