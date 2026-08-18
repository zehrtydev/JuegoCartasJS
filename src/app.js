/**
 * Punto de entrada principal de la aplicación.
 * En esta fase se integra la base del dominio del juego y la estructura visual.
 */
import { createGameState } from './services/gameService.js';
import { seedCards } from './data/seedCards.js';

const playerDeck = seedCards.slice(0, 5);
const machineDeck = seedCards.slice(5, 10);
const state = createGameState(playerDeck, machineDeck);

export function renderApp(root) {
  if (!root) return;

  root.innerHTML = `
    <main class="game-shell">
      <section class="status-panel">
        <p class="eyebrow">POKÉMON · GEN 1</p>
        <h1>Card Battle Arena</h1>
        <p class="subtitle">Base del dominio integrada correctamente.</p>
      </section>

      <section class="game-summary">
        <div class="summary-card">
          <span class="label">Turno actual</span>
          <strong>${state.currentTurn}</strong>
        </div>
        <div class="summary-card">
          <span class="label">Cartas jugador</span>
          <strong>${playerDeck.length}</strong>
        </div>
        <div class="summary-card">
          <span class="label">Cartas máquina</span>
          <strong>${machineDeck.length}</strong>
        </div>
      </section>

      <section class="battle-preview">
        <article class="fighter player">
          <h2>Jugador</h2>
          <p>${state.activePlayerCard?.name || 'Sin carta'}</p>
          <small>HP: ${state.activePlayerCard?.hp || 250}</small>
        </article>

        <article class="fighter machine">
          <h2>Máquina</h2>
          <p>${state.activeMachineCard?.name || 'Sin carta'}</p>
          <small>HP: ${state.activeMachineCard?.hp || 250}</small>
        </article>
      </section>

      <section class="rules-panel">
        <h3>Reglas integradas</h3>
        <ul>
          <li>Nickname válido y único.</li>
          <li>Maestro de 5 cartas.</li>
          <li>Turnos alternados.</li>
          <li>Daño con factor aleatorio.</li>
          <li>Defensa con reducción del 50%.</li>
          <li>Poder especial con cooldown.</li>
          <li>Leaderboard y historial de partidas.</li>
        </ul>
      </section>
    </main>
  `;
}
