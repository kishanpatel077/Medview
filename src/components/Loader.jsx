import { motion } from 'framer-motion';

export default function Loader({ label = 'Loading study' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-muted">
      <motion.span
        animate={{ rotate: 360 }}
        className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-accent"
        transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
      />
      {label}
    </div>
  );
}
