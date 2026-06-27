import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function Modal({ children, onClose, open, title }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-700 dark:bg-card"
            exit={{ scale: 0.96, y: 16 }}
            initial={{ scale: 0.96, y: 16 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
              <button
                aria-label="Close modal"
                className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={onClose}
                type="button"
              >
                <FiX />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
