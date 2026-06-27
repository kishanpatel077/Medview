import { motion } from 'framer-motion';
import ctAxial from '../assets/ct_axial.png';
import mriSag from '../assets/mri_sag.png';
import xrChest from '../assets/xr_chest.png';
import ctCor from '../assets/ct_cor.png';

const panels = [
  { title: 'CT AXIAL', img: ctAxial, meta: 'S: 128 / 312', accent: 'text-blue-300' },
  { title: 'MRI SAG', img: mriSag, meta: 'T2 FLAIR', accent: 'text-cyan-300' },
  { title: 'XR CHEST', img: xrChest, meta: 'PA VIEW', accent: 'text-emerald-300' },
  { title: 'CT COR', img: ctCor, meta: 'MPR', accent: 'text-indigo-300' },
];

function ScanPanel({ panel, active }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.72 }}
      className="relative min-h-[240px] overflow-hidden rounded-md border border-slate-700 bg-slate-950 scan-grid sm:min-h-[300px] xl:min-h-[360px] 3xl:min-h-[520px]"
      whileHover={{ scale: 1.005 }}
    >
      <div className="absolute left-3 top-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-white">
        {panel.title}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-muted">
        {panel.meta}
      </div>
      <div className="absolute inset-x-6 bottom-5 top-12 overflow-hidden rounded-md border border-slate-600/60 bg-slate-900 flex items-center justify-center">
        <img src={panel.img} alt={panel.title} className="w-full h-full object-contain opacity-90" />
        <div className="absolute inset-0 viewer-noise opacity-[0.06] pointer-events-none" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-blue-300/20 pointer-events-none" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-blue-300/20 pointer-events-none" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-muted">
        <span>512 x 512</span>
        <span className={panel.accent}>DICOM</span>
      </div>
    </motion.div>
  );
}

export default function DicomViewer({ layout = '4' }) {
  const visiblePanels = layout === '1' ? panels.slice(0, 1) : layout === '2' ? panels.slice(0, 2) : panels;
  const gridClass =
    layout === '1'
      ? 'grid-cols-1'
      : layout === '2'
        ? 'grid-cols-1 xl:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {visiblePanels.map((panel, index) => (
        <ScanPanel active={index === 0} key={panel.title} panel={panel} />
      ))}
    </div>
  );
}
