import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const location = useLocation();

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <AppRoutes key={location.pathname} location={location} />
      </AnimatePresence>
    </MainLayout>
  );
}
