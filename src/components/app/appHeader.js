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
      <header class="border-b border-slate-800 bg-slate-950/90">
        <div class="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <a class="w-fit rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-300" href="#home" data-view="home" aria-label="Ir al inicio de Card Battle Arena">
            <span class="block text-xs font-bold tracking-[0.25em] text-amber-300">POKÉMON · GEN 1</span>
            <span class="block text-xl font-black tracking-tight text-slate-100">Card Battle Arena</span>
          </a>
          <nav aria-label="Navegación principal">
            <ul class="flex flex-wrap gap-2">
              ${navigationItems.map(({ id, label }) => `
                <li><a class="rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 ${this.#activeView === id ? 'bg-slate-800 text-amber-300' : 'text-slate-300'}" href="#${id}" data-view="${id}" ${this.#activeView === id ? 'aria-current="page"' : ''}>${label}</a></li>
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
