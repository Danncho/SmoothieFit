import { Outlet } from 'react-router-dom';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import SorbiWidget from './sorbi/SorbiWidget.jsx';

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <SorbiWidget />
    </>
  );
}

export default Layout;
