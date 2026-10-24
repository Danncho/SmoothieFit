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
import AsistentePage from './pages/AsistentePage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const pages = [
  { path: '/smoothies', element: <SmoothiesPage /> },
  { path: '/crea-tu-smoothie', title: 'Crea tu smoothie' },
  { path: '/productores', element: <ProducersPage /> },
  { path: '/colegios', element: <CollegesPage /> },
  { path: '/puntos-de-venta', element: <SalesPointsPage /> },
  { path: '/sostenibilidad', element: <SustainabilityPage /> },
  { path: '/nosotros', element: <AboutPage /> },
  { path: '/contacto', element: <ContactPage /> },
  { path: '/asistente', element: <AsistentePage /> }
];

function App() {
  return (
    <AuthProvider>
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
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
