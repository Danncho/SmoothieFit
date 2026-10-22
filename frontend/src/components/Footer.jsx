import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Smoothies', path: '/smoothies' },
  { label: 'Productores', path: '/productores' },
  { label: 'Sostenibilidad', path: '/sostenibilidad' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Contacto', path: '/contacto' }
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <section aria-labelledby="footer-links-title">
          <h2 className="footer-heading" id="footer-links-title">Explora SmoothieFit</h2>
          <ul className="footer-links">
            {footerLinks.map((item) => (
              <li key={item.path}><Link to={item.path}>{item.label}</Link></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="footer-social-title">
          <h2 className="footer-heading" id="footer-social-title">Redes sociales</h2>
          <ul className="social-links">
            <li><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a href="https://www.tiktok.com/" target="_blank" rel="noreferrer">TikTok</a></li>
            <li><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a></li>
          </ul>
          <p className="social-note">Enlaces de ejemplo; aún no son perfiles oficiales.</p>
        </section>
        <p className="project-note">Proyecto académico</p>
        <p className="admin-link"><Link to="/admin">Administración</Link></p>
      </div>
    </footer>
  );
}

export default Footer;
