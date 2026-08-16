class BattleArena extends HTMLElement {
  #battle = null

  set battle(value) {
    this.#battle = value
    if (this.isConnected) this.#render()
  }

  get battle() {
    return this.#battle
  }

  connectedCallback() {
    this.#render()
  }

  #render() {
    this.innerHTML = `
      <section class="pixelFrame arenaStage mx-auto max-w-6xl bg-surface p-2 sm:p-3" aria-labelledby="arena-title">
        <header class="flex flex-wrap items-center justify-between gap-4 border border-brass/60 bg-arena-deep px-5 py-4 sm:px-7">
          <div>
            <p class="font-mono text-xs font-bold tracking-[0.2em] text-action">COMBATE POR TURNOS</p>
            <h1 class="mt-1 text-2xl font-black tracking-[0.06em] text-cream sm:text-3xl" id="arena-title">ARENA DE BATALLA</h1>
          </div>
          <p class="border border-brass bg-surface px-3 py-2 font-mono text-xs font-bold tracking-wider text-cream">TURNO: <span class="text-muted">PENDIENTE</span></p>
        </header>
        <div class="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div class="p-6 sm:p-8">
            <div class="grid gap-4 sm:grid-cols-2">
              <article class="border border-danger/70 bg-arena-deep/50 p-4" aria-label="Pokémon activo del bot">
                <div class="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-wider">
                  <span class="text-danger">BOT · ACTIVO</span>
                  <span class="text-muted">SIN REVELAR</span>
                </div>
                <div class="cardBack mx-auto mt-4 max-w-[12rem]" aria-hidden="true"><span class="captureSeal scale-90"></span></div>
                <p class="mt-3 text-center font-mono text-xs text-muted">HP: — / 250</p>
              </article>
              <article class="border border-success/70 bg-arena-deep/50 p-4" aria-label="Pokémon activo del jugador">
                <div class="flex items-center justify-between gap-3 font-mono text-xs font-bold tracking-wider">
                  <span class="text-success">TÚ · ACTIVO</span>
                  <span class="text-muted">SIN SELECCIÓN</span>
                </div>
                <div class="cardBack mx-auto mt-4 max-w-[12rem]" aria-hidden="true"><span class="captureSeal scale-90"></span></div>
                <p class="mt-3 text-center font-mono text-xs text-muted">HP: — / 250</p>
              </article>
            </div>
            <section class="mt-5 border border-brass bg-arena-deep/50 p-4" aria-labelledby="actions-title">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="font-mono text-xs font-bold tracking-[0.18em] text-cream" id="actions-title">ACCIONES DE COMBATE</h2>
                <span class="font-mono text-xs text-muted">ESPERANDO INICIO DE PARTIDA</span>
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                ${Array.from({ length: 4 }, (_, index) => `<button class="border border-brass bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-muted opacity-40" type="button" disabled>ATAQUE ${index + 1}<span class="mt-1 block font-normal">No disponible</span></button>`).join('')}
                <button class="border border-defense bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-muted opacity-40" type="button" disabled>DEFENSA<span class="mt-1 block font-normal">No disponible</span></button>
                <button class="border border-action bg-surface px-4 py-3 text-left font-mono text-xs font-bold text-muted opacity-40" type="button" disabled>ESPECIAL<span class="mt-1 block font-normal">Requiere turno 2</span></button>
              </div>
            </section>
          </div>
          <aside class="border-t-2 border-brass bg-panel p-6 sm:p-8 lg:border-t-0 lg:border-l-2" aria-labelledby="log-title">
            <h2 class="font-mono text-sm font-black tracking-wider text-cream" id="log-title">REGISTRO DE BATALLA</h2>
            <div class="mt-4 border border-dashed border-brass bg-arena-deep/50 p-5" role="status">
              <span class="captureSeal mx-auto scale-90" aria-hidden="true"></span>
              <p class="mt-4 text-center text-sm leading-6 text-muted">El registro mostrará aquí cada ataque, defensa, modificador de tipo, KO y relevo cuando la partida se inicie.</p>
            </div>
            <div class="mt-6">
              <p class="font-mono text-xs font-bold tracking-wider text-cream">EQUIPOS</p>
              <div class="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
                ${Array.from({ length: 5 }, () => '<div class="cardBack aspect-square"><span class="captureSeal scale-[0.55]"></span></div>').join('')}
              </div>
              <div class="mt-3 grid grid-cols-5 gap-2" aria-hidden="true">
                ${Array.from({ length: 5 }, () => '<div class="cardBack aspect-square"><span class="captureSeal scale-[0.55]"></span></div>').join('')}
              </div>
            </div>
          </aside>
        </div>
        <div class="border-t-2 border-brass bg-arena-deep p-4 text-center" role="status">
          <p class="font-mono text-sm font-bold tracking-wide text-action">LA ARENA SE ACTIVARÁ CUANDO EXISTA UN EQUIPO CONFIRMADO</p>
        </div>
      </section>
    `
  }
}

customElements.define('battle-arena', BattleArena)
