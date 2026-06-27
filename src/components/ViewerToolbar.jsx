import {
  FiCrop,
  FiCrosshair,
  FiMaximize,
  FiMove,
  FiRefreshCw,
  FiRotateCw,
  FiSun,
  FiTarget,
  FiZoomIn,
} from 'react-icons/fi';
import { TbContrast, TbContrast2, TbRulerMeasure } from 'react-icons/tb';

const tools = [
  { icon: FiZoomIn, label: 'Zoom' },
  { icon: FiMove, label: 'Pan' },
  { icon: FiRotateCw, label: 'Rotate' },
  { icon: FiRefreshCw, label: 'Reset' },
  { icon: FiCrop, label: 'Window Level' },
  { icon: FiSun, label: 'Brightness' },
  { icon: TbContrast, label: 'Contrast' },
  { icon: TbContrast2, label: 'Invert' },
  { icon: FiMaximize, label: 'Fullscreen' },
  { icon: TbRulerMeasure, label: 'Measurement Tool' },
  { icon: FiTarget, label: 'Annotation Tool' },
];

export default function ViewerToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-darkSecondary">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            className="group relative grid h-10 w-10 place-items-center rounded-md border border-transparent text-slate-600 transition hover:border-accent hover:bg-blue-500/10 hover:text-primary dark:text-slate-300 dark:hover:text-accent"
            key={tool.label}
            type="button"
          >
            <Icon size={18} />
            <span className="pointer-events-none absolute left-1/2 top-12 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-950">
              {tool.label}
            </span>
          </button>
        );
      })}
      <div className="ml-auto hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:text-muted sm:flex">
        <FiCrosshair />
        WL 42 / WW 380
      </div>
    </div>
  );
}
