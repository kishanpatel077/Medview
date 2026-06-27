import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiDatabase,
  FiGrid,
  FiLayers,
  FiShield,
  FiUploadCloud,
  FiZap,
} from 'react-icons/fi';
import Button from '../components/Button.jsx';
import DicomViewer from '../components/DicomViewer.jsx';
import PageTransition from '../components/PageTransition.jsx';
import UploadZone from '../components/UploadZone.jsx';
import ctAxial from '../assets/ct_axial.png';
import mriSag from '../assets/mri_sag.png';
import xrChest from '../assets/xr_chest.png';

const features = [
  { icon: FiUploadCloud, title: 'ZIP DICOM Upload', text: 'Bring complete imaging studies into the browser quickly.' },
  { icon: FiGrid, title: 'Multi-Panel Layouts', text: 'Switch between single, dual, and four-up viewer workflows.' },
  { icon: FiDatabase, title: 'Metadata Inspection', text: 'Review study, series, and image tags alongside the viewport.' },
  { icon: FiZap, title: 'Fast Viewer Tools', text: 'Use zoom, pan, window level, brightness, contrast, and invert.' },
];

const screenshots = [
  { title: 'CT Slice Review', img: ctAxial },
  { title: 'MRI Series Comparison', img: mriSag },
  { title: 'X-Ray Viewport', img: xrChest },
];

export default function Home() {
  return (
    <PageTransition>
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-dark">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1920px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.84fr_1.16fr] lg:py-16 xl:px-8 3xl:gap-14">
          <motion.div animate={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -24 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-md border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-primary dark:text-blue-200">
              <FiShield />
              Modern Web-Based DICOM Viewer
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl xl:text-6xl 3xl:text-7xl">
              Advanced DICOM Viewer for CT, MRI and X-Ray Studies
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-muted sm:text-lg">
              Upload ZIP DICOM studies and visualize medical images with a fast, modern browser-based viewer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/viewer">
                Open Viewer <FiArrowRight />
              </Button>
              <Button to="/viewer" variant="secondary">
                <FiUploadCloud /> Upload DICOM ZIP
              </Button>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-panel dark:border-slate-800 dark:bg-darkSecondary"
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <div className="mb-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-muted">MedView Viewer Workspace</span>
            </div>
            <DicomViewer layout="4" />
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Upload Workflow</p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
                Designed around study upload, slice review, and metadata.
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-600 dark:text-muted">
                MedView keeps the workspace focused on imaging. The interface gives specialists a fast route from ZIP
                upload to series navigation, viewport controls, and DICOM tag inspection.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-card"
                      key={feature.title}
                      whileHover={{ y: -4 }}
                    >
                      <Icon className="text-primary" size={22} />
                      <h3 className="mt-3 font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-muted">{feature.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <UploadZone />
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16 dark:bg-dark">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Product Screenshots</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Radiology-grade viewing surfaces</h2>
            </div>
            <Button to="/features" variant="secondary">
              Explore Features <FiLayers />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {screenshots.map((item) => (
              <motion.div
                className="overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-darkSecondary"
                key={item.title}
                whileHover={{ y: -5 }}
              >
                <div className="relative h-64 overflow-hidden rounded-md bg-slate-950 scan-grid flex items-center justify-center">
                  <img src={item.img} alt={item.title} className="w-full h-full object-contain opacity-90" />
                  <div className="absolute inset-0 viewer-noise opacity-[0.06] pointer-events-none" />
                  <div className="absolute left-3 top-3 rounded bg-slate-950/75 px-2 py-1 text-xs font-semibold text-white">
                    {item.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
