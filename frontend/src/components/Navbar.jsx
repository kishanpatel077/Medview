import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiActivity, FiMenu, FiX } from 'react-icons/fi';
import ThemeSwitcher from './ThemeSwitcher.jsx';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Viewer', to: '/viewer' },
  { label: 'Features', to: '/features' },
  { label: 'Docs', to: '/documentation' },
  { label: 'Contact', to: '/contact' },
];

function navClass({ isActive }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-primary text-white'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white',
  ].join(' ');
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/90">
      <nav className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between px-4 sm:px-6 xl:px-8">
        <NavLink className="flex items-center gap-3" to="/" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white shadow-glow">
            <FiActivity size={22} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-normal text-slate-950 dark:text-white">MedView</span>
            <span className="hidden text-xs text-slate-500 dark:text-zinc-500 sm:block">
              Modern Web-Based DICOM Viewer
            </span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} className={navClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeSwitcher />
          <NavLink
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-500"
            to="/viewer"
          >
            Open Viewer
          </NavLink>
        </div>

        <button
          aria-label="Toggle navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 dark:border-zinc-800 dark:text-zinc-200 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {open && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-slate-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black/95 lg:hidden"
          initial={{ opacity: 0, y: -10 }}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.to} className={navClass} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between">
              <ThemeSwitcher />
              <NavLink
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                to="/viewer"
                onClick={() => setOpen(false)}
              >
                Open Viewer
              </NavLink>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
