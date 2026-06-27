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

export default function ViewerToolbar({
  activeTool,
  setActiveTool,
  brightness,
  contrast,
  zoom = 100,
  invert,
  setInvert,
  rotation,
  setRotation,
  onReset,
  measurementCount = 0,
}) {
  return (
    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-slate-800 dark:bg-darkSecondary sm:gap-2 sm:flex-wrap sm:overflow-visible sm:px-2 sm:py-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive =
          activeTool === tool.label ||
          (tool.label === 'Invert' && invert) ||
          (tool.label === 'Rotate' && rotation > 0) ||
          (tool.label === 'Zoom' && zoom !== 100) ||
          (tool.label === 'Measurement Tool' && (measurementCount > 0 || activeTool === 'Measurement Tool'));

        return (
          <button
            className={[
              'group relative grid h-9 w-9 shrink-0 place-items-center rounded-md border text-slate-600 transition sm:h-10 sm:w-10',
              isActive
                ? 'border-primary bg-blue-500/10 text-primary dark:border-accent dark:text-accent'
                : 'border-transparent hover:border-accent hover:bg-blue-500/10 hover:text-primary dark:text-slate-300 dark:hover:text-accent',
            ].join(' ')}
            key={tool.label}
            type="button"
            title={tool.label}
            onClick={() => {
              if (tool.label === 'Invert') {
                setInvert(!invert);
              } else if (tool.label === 'Rotate') {
                setRotation((prev) => (prev + 90) % 360);
              } else if (tool.label === 'Reset') {
                onReset();
              } else if (tool.label === 'Fullscreen') {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen();
                }
              } else {
                setActiveTool(activeTool === tool.label ? null : tool.label);
              }
            }}
          >
            <Icon size={17} />
            {/* Tooltip — hidden on mobile, shows on hover desktop */}
            <span className="pointer-events-none absolute left-1/2 top-11 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-950">
              {tool.label}
            </span>
          </button>
        );
      })}

      {/* Status readout — only on sm+ screens */}
      <div className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-muted sm:flex sm:text-xs">
        <FiCrosshair size={12} />
        <span>BR:{brightness}%</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>CO:{contrast}%</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>ZM:{zoom}%</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>ROT:{rotation}°</span>
        {measurementCount > 0 && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>MS:{measurementCount}</span>
          </>
        )}
      </div>
    </div>
  );
}
