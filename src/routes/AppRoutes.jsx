import { Route, Routes } from 'react-router-dom';
import Contact from '../pages/Contact.jsx';
import Documentation from '../pages/Documentation.jsx';
import Features from '../pages/Features.jsx';
import Home from '../pages/Home.jsx';
import Viewer from '../pages/Viewer.jsx';

export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/viewer" element={<Viewer />} />
      <Route path="/features" element={<Features />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
