import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import useScrollTop from '../hooks/useScrollTop.js';

export default function MainLayout({ children }) {
  useScrollTop();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-background dark:text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
