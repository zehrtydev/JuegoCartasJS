/**
 * Punto de entrada temporal. Las vistas y componentes se irán registrando aquí
 * cuando se implemente la navegación del juego.
 */
export function renderApp(root) {
  root.innerHTML = `
    <main class="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-100">
      <section class="max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <p class="text-sm font-semibold tracking-[0.2em] text-amber-400">POKÉMON · GEN 1</p>
        <h1 class="mt-2 text-4xl font-bold">Card Battle Arena</h1>
        <p class="mt-4 text-slate-300">Base del proyecto preparada. La primera pantalla se implementará sobre esta estructura.</p>
      </section>
    </main>
  `
}
