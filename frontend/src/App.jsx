import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import CollegesPage from './pages/CollegesPage.jsx';
import ProducersPage from './pages/ProducersPage.jsx';
import SalesPointsPage from './pages/SalesPointsPage.jsx';
import SmoothiesPage from './pages/SmoothiesPage.jsx';
import SustainabilityPage from './pages/SustainabilityPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

const pages = [
  { path: '/smoothies', element: <SmoothiesPage /> },
  { path: '/crea-tu-smoothie', title: 'Crea tu smoothie' },
  { path: '/productores', element: <ProducersPage /> },
  { path: '/colegios', element: <CollegesPage /> },
  { path: '/puntos-de-venta', element: <SalesPointsPage /> },
  { path: '/sostenibilidad', element: <SustainabilityPage /> },
  { path: '/nosotros', element: <AboutPage /> },
  { path: '/contacto', element: <ContactPage /> },
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
            element={page.element || <PlaceholderPage title={page.title} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
