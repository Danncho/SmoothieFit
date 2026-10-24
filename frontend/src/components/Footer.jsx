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
        <p className="project-note">Proyecto académico</p>
        <p className="admin-link"><Link to="/admin">Administración</Link></p>
      </div>
    </footer>
  );
}

export default Footer;
