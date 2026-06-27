const series = [
  { label: 'CT Axial', value: 72, color: 'bg-blue-500' },
  { label: 'MRI T2', value: 54, color: 'bg-cyan-400' },
  { label: 'X-Ray PA', value: 18, color: 'bg-emerald-400' },
];

export default function SeriesPanel() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-darkSecondary">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Multi-Series Navigation</h3>
      <div className="mt-4 grid gap-3">
        {series.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              <span className="text-slate-500 dark:text-muted">{item.value} images</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
