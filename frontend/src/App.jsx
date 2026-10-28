import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
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
import ConstructorPage from './pages/ConstructorPage.jsx';

const pages = [
  { path: '/smoothies', element: <SmoothiesPage /> },
  { path: '/productores', element: <ProducersPage /> },
  { path: '/colegios', element: <CollegesPage /> },
  { path: '/sucursales', element: <SalesPointsPage /> },
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
          <Route path="/crea-tu-smoothie" element={<ConstructorPage />} />
          <Route path="/puntos-de-venta" element={<Navigate to="/sucursales" replace />} />
          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={page.element}
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
