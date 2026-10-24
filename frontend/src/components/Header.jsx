import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Smoothies', path: '/smoothies' },
  { label: 'Sorbi', path: '/asistente' },
  { label: 'Productores', path: '/productores' },
  { label: 'Colegios', path: '/colegios' },
  { label: 'Puntos de venta', path: '/puntos-de-venta' },
  { label: 'Sostenibilidad', path: '/sostenibilidad' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/contacto' }
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="SmoothieFit, inicio" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">☺</span>
          <span>SmoothieFit</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav
          className={`main-nav${menuOpen ? ' is-open' : ''}`}
          id="main-navigation"
          aria-label="Navegación principal"
        >
          <ul>
            {navigationItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => [
                    item.featured ? 'nav-featured' : '',
                    isActive ? 'is-active' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
