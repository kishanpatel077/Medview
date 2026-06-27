import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSwitcher() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-accent hover:text-primary dark:border-zinc-800 dark:bg-black dark:text-zinc-200 dark:hover:border-zinc-700"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
