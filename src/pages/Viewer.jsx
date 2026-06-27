import { useState } from 'react';
import { FiGrid, FiMaximize2, FiMonitor, FiSliders } from 'react-icons/fi';
import DicomViewer from '../components/DicomViewer.jsx';
import MetadataPanel from '../components/MetadataPanel.jsx';
import PageTransition from '../components/PageTransition.jsx';
import SeriesPanel from '../components/SeriesPanel.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StudyExplorer from '../components/StudyExplorer.jsx';
import UploadZone from '../components/UploadZone.jsx';
import ViewerToolbar from '../components/ViewerToolbar.jsx';

const layouts = [
  { label: 'Single View', value: '1', icon: FiMonitor },
  { label: '2 View Layout', value: '2', icon: FiMaximize2 },
  { label: '4 View Layout', value: '4', icon: FiGrid },
];

export default function Viewer() {
  const [layout, setLayout] = useState('4');

  return (
    <PageTransition className="bg-slate-100 dark:bg-background">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[2400px] flex-col gap-4 px-3 py-4 sm:px-4 xl:px-5 3xl:px-8">
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-dark">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">MedView Viewer</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">DICOM Study Workspace</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {layouts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={[
                    'inline-flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition',
                    layout === item.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  ].join(' ')}
                  key={item.value}
                  onClick={() => setLayout(item.value)}
                  type="button"
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px] 3xl:grid-cols-[380px_minmax(0,1fr)_400px]">
          <div className="grid gap-4 xl:content-start">
            <Sidebar>
              <StudyExplorer />
            </Sidebar>
            <SeriesPanel />
            <UploadZone compact />
          </div>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-dark">
            <ViewerToolbar />
            <div className="mt-3">
              <DicomViewer layout={layout} />
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-darkSecondary">
              <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <FiSliders className="text-primary" />
                  Slice Navigation
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-muted">Frame 128 of 312</div>
              </div>
              <input aria-label="Slice navigation" className="range" max="312" min="1" type="range" value="128" readOnly />
              <div className="mt-3 grid grid-cols-3 text-xs text-slate-500 dark:text-muted">
                <span>Image 001</span>
                <span className="text-center">Frame Navigation</span>
                <span className="text-right">Image 312</span>
              </div>
            </div>
          </section>

          <Sidebar className="xl:content-start">
            <MetadataPanel />
          </Sidebar>
        </div>
      </div>
    </PageTransition>
  );
}
