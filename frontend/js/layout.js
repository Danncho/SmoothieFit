const header = `
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html" aria-label="SmoothieFit, inicio">
        <span class="brand-mark" aria-hidden="true">☺</span>
        <span>SmoothieFit</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Abrir menú">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span class="visually-hidden">Abrir menú</span>
      </button>
      <nav class="main-nav" id="main-navigation" aria-label="Navegación principal">
        <ul>
          <li><a href="index.html">Inicio</a></li>
          <li><a href="smoothies.html">Smoothies</a></li>
          <li><a class="nav-featured button" href="crea-tu-smoothie.html">Crea tu smoothie</a></li>
          <li><a href="productores.html">Productores</a></li>
          <li><a href="colegios.html">Colegios</a></li>
          <li><a href="puntos-de-venta.html">Puntos de venta</a></li>
          <li><a href="pedidos.html">Pedidos</a></li>
          <li><a href="sostenibilidad.html">Sostenibilidad</a></li>
          <li><a href="nosotros.html">Nosotros</a></li>
          <li><a href="contacto.html">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>
`;

const footer = `
  <footer class="site-footer">
    <div class="container footer-inner">
      <section aria-labelledby="footer-links-title">
        <h2 class="footer-heading" id="footer-links-title">Explora SmoothieFit</h2>
        <ul class="footer-links">
          <li><a href="smoothies.html">Smoothies</a></li>
          <li><a href="productores.html">Productores</a></li>
          <li><a href="sostenibilidad.html">Sostenibilidad</a></li>
          <li><a href="nosotros.html">Nosotros</a></li>
          <li><a href="contacto.html">Contacto</a></li>
        </ul>
      </section>
      <section aria-labelledby="footer-social-title">
        <h2 class="footer-heading" id="footer-social-title">Redes sociales</h2>
        <ul class="social-links">
          <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer">TikTok</a></li>
          <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        </ul>
      </section>
      <p class="project-note">Proyecto académico</p>
      <p class="admin-link"><a href="admin.html">Administración</a></p>
    </div>
  </footer>
`;

document.body.insertAdjacentHTML('afterbegin', header);
document.body.insertAdjacentHTML('beforeend', footer);

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    closeMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
});
