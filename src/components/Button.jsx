import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-primary text-white shadow-glow hover:bg-blue-500',
  secondary:
    'border border-slate-300 bg-white text-slate-900 hover:border-accent hover:text-primary dark:border-slate-700 dark:bg-slate-900/70 dark:text-white dark:hover:border-accent',
  ghost: 'text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800',
};

export default function Button({ children, className = '', variant = 'primary', to, ...props }) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
        <Link className={classes} to={to} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
