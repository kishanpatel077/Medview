export default function Sidebar({ children, className = '', title }) {
  return (
    <aside
      className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-darkSecondary ${className}`}
    >
      {title && (
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-muted">{title}</h2>
        </div>
      )}
      {children}
    </aside>
  );
}
