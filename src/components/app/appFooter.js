class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="gameFooter">
        <p><span aria-hidden="true">©</span> DESARROLLADO POR <strong>ZEHRTY</strong> Y <strong>ZATO</strong></p>
      </footer>
    `
  }
}

customElements.define('app-footer', AppFooter)
