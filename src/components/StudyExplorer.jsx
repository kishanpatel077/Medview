import { FiChevronDown, FiFileText, FiLayers } from 'react-icons/fi';

const studies = [
  {
    title: 'Uploaded Study List',
    items: ['Chest Trauma ZIP', 'Neuro MRI Folder', 'Portable X-Ray Study'],
  },
  {
    title: 'CT Series',
    items: ['CT Chest Axial', 'CT Coronal MPR', 'CT Lung Window'],
  },
  {
    title: 'MRI Series',
    items: ['T1 Axial', 'T2 Sagittal', 'FLAIR Coronal'],
  },
  {
    title: 'X-Ray Series',
    items: ['Chest PA', 'Chest Lateral', 'Extremity AP'],
  },
];

export default function StudyExplorer() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Study Explorer</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-muted">Local DICOM studies and series</p>
      </div>
      <div className="space-y-3">
        {studies.map((study, index) => (
          <section className="rounded-md border border-slate-200 dark:border-slate-800" key={study.title}>
            <button
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-muted"
              type="button"
            >
              <span className="flex items-center gap-2">
                <FiLayers />
                {study.title}
              </span>
              <FiChevronDown />
            </button>
            <div className="grid gap-1 px-2 pb-2">
              {study.items.map((item, itemIndex) => (
                <button
                  className={[
                    'flex items-center gap-2 rounded px-2 py-2 text-left text-sm transition',
                    index === 1 && itemIndex === 0
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  ].join(' ')}
                  key={item}
                  type="button"
                >
                  <FiFileText />
                  {item}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
