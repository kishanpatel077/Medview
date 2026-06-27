export default function SeriesPanel({ seriesList = [], activeSeriesUid, onSelectSeries }) {
  if (!seriesList || seriesList.length === 0) {
    return null;
  }

  // Find max number of images in any series for progress bar calculation
  const maxImages = Math.max(...seriesList.map(s => s.instances?.length || 1));

  const colors = ['bg-blue-500', 'bg-cyan-400', 'bg-emerald-400', 'bg-indigo-500', 'bg-purple-500'];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-darkSecondary">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Multi-Series Navigation</h3>
      <div className="mt-4 grid gap-3">
        {seriesList.map((item, idx) => {
          const isActive = item.seriesInstanceUid === activeSeriesUid;
          const imageCount = item.instances?.length || 0;
          const colorClass = colors[idx % colors.length];
          const percentage = maxImages > 0 ? (imageCount / maxImages) * 100 : 0;

          return (
            <div 
              key={item.seriesInstanceUid}
              className={`cursor-pointer rounded p-1 transition ${isActive ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              onClick={() => onSelectSeries && onSelectSeries(item.seriesInstanceUid)}
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className={`font-medium ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.seriesDescription || `Series ${item.seriesNumber}`}
                </span>
                <span className="text-slate-500 dark:text-muted">{imageCount} images</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

