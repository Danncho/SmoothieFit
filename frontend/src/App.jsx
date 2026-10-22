import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

const pages = [
  { path: '/smoothies', title: 'Smoothies' },
  { path: '/crea-tu-smoothie', title: 'Crea tu smoothie' },
  { path: '/productores', title: 'Productores' },
  { path: '/colegios', title: 'Colegios' },
  { path: '/puntos-de-venta', title: 'Puntos de venta' },
  { path: '/sostenibilidad', title: 'Sostenibilidad' },
  { path: '/nosotros', title: 'Nosotros' },
  { path: '/contacto', title: 'Contacto' },
  { path: '/admin', title: 'Administración' }
];

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        {pages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.title} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
