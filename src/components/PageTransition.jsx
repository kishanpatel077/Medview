import { motion } from 'framer-motion';

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className={className}
      exit={{ opacity: 0, y: 16 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
