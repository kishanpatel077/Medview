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
import ctAxial from '../assets/ct_axial.png';
import mriSag from '../assets/mri_sag.png';
import xrChest from '../assets/xr_chest.png';

const features = [
  { icon: FiUploadCloud, title: 'ZIP DICOM Upload', text: 'Bring complete imaging studies into the browser quickly.' },
  { icon: FiGrid, title: 'Multi-Panel Layouts', text: 'Switch between single and dual viewer workflows.' },
  { icon: FiDatabase, title: 'Metadata Inspection', text: 'Review study, series, and image tags alongside the viewport.' },
  { icon: FiZap, title: 'Fast Viewer Tools', text: 'Use zoom, pan, window level, brightness, contrast, and invert.' },
];

const screenshots = [
  { title: 'CT Slice Review', img: ctAxial },
  { title: 'MRI Series Comparison', img: mriSag },
  { title: 'X-Ray Viewport', img: xrChest },
];

const ease = [0.22, 1, 0.36, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 32, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const viewport = { once: true, margin: '-80px' };

export default function Home() {
  return (
    <PageTransition>
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-dark">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -24, 0], scale: [1, 1.08, 1] }}
            className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/12 blur-3xl dark:bg-primary/20"
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
            className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl dark:bg-accent/15"
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_55%)]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1920px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.84fr_1.16fr] lg:py-16 xl:px-8 3xl:gap-14">
          {/* Left: Text Content */}
          <motion.div
            animate="visible"
            className="flex flex-col items-start"
            initial="hidden"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-md border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-sm font-medium text-primary dark:text-blue-200"
              variants={fadeInUp}
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FiShield size={14} />
              </motion.span>
              Modern Web-Based DICOM Viewer
            </motion.div>

            <motion.h1
              className="mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-normal text-slate-950 dark:text-white sm:mt-6 sm:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl"
              variants={fadeInUp}
            >
              Advanced DICOM Viewer for CT, MRI and X-Ray Studies
            </motion.h1>

            <motion.p
              className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-muted sm:mt-5 sm:text-lg"
              variants={fadeInUp}
            >
              Upload ZIP DICOM studies and visualize medical images with a fast, modern browser-based viewer.
            </motion.p>

            <motion.div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row" variants={fadeInUp}>
              <Button to="/viewer">
                Open Viewer <FiArrowRight />
              </Button>
              <Button to="/features" variant="secondary">
                View Features <FiLayers />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Demo Viewer */}
          <motion.div
            animate="visible"
            className="group relative rounded-lg border border-slate-200 bg-white p-3 shadow-panel transition-shadow duration-500 hover:shadow-glow dark:border-slate-800 dark:bg-darkSecondary"
            initial="hidden"
            variants={fadeInRight}
          >
            <div className="pointer-events-none absolute -inset-px rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              className="relative"
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="mb-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-muted">MedView Viewer Workspace</span>
              </div>
              <DicomViewer layout="2" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="bg-white py-12 dark:bg-background sm:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
          <motion.div
            initial="hidden"
            variants={staggerContainer}
            viewport={viewport}
            whileInView="visible"
          >
            <motion.p
              className="text-sm font-semibold uppercase tracking-[0.18em] text-primary"
              variants={fadeInUp}
            >
              Upload Workflow
            </motion.p>
            <motion.h2
              className="mt-3 text-2xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-3xl sm:text-4xl"
              variants={fadeInUp}
            >
              Designed around study upload, slice review, and metadata.
            </motion.h2>
            <motion.p
              className="mt-4 max-w-4xl text-sm leading-7 text-slate-600 dark:text-muted sm:text-base"
              variants={fadeInUp}
            >
              MedView keeps the workspace focused on imaging. The interface gives specialists a fast route from ZIP
              upload to series navigation, viewport controls, and DICOM tag inspection.
            </motion.p>

            <motion.div
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={staggerFast}
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors duration-300 hover:border-primary/30 hover:bg-white dark:border-slate-800 dark:bg-card dark:hover:border-primary/40 dark:hover:bg-slate-800/80"
                    key={feature.title}
                    variants={fadeInUp}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <motion.div
                      className="relative grid h-11 w-11 place-items-center rounded-md bg-blue-500/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon size={22} />
                    </motion.div>
                    <h3 className="relative mt-3 font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                    <p className="relative mt-2 text-sm leading-6 text-slate-600 dark:text-muted">{feature.text}</p>
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                      initial={{ width: '0%' }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.35, ease }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── SCREENSHOTS SECTION ─── */}
      <section className="bg-slate-100 py-12 dark:bg-dark sm:py-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 xl:px-8">
          <motion.div
            className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
            initial="hidden"
            variants={staggerContainer}
            viewport={viewport}
            whileInView="visible"
          >
            <div>
              <motion.p
                className="text-sm font-semibold uppercase tracking-[0.18em] text-primary"
                variants={fadeInUp}
              >
                Product Screenshots
              </motion.p>
              <motion.h2
                className="mt-3 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl"
                variants={fadeInUp}
              >
                Radiology-grade viewing surfaces
              </motion.h2>
            </div>
            <motion.div className="shrink-0" variants={fadeInUp}>
              <Button to="/features" variant="secondary">
                Explore Features <FiLayers />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
            initial="hidden"
            variants={staggerFast}
            viewport={viewport}
            whileInView="visible"
          >
            {screenshots.map((item, index) => (
              <motion.div
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow duration-300 hover:border-primary/25 hover:shadow-panel dark:border-slate-800 dark:bg-darkSecondary dark:hover:border-primary/30"
                key={item.title}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="relative h-48 overflow-hidden rounded-md bg-slate-950 scan-grid sm:h-56 md:h-64">
                  <motion.img
                    alt={item.title}
                    className="h-full w-full object-contain opacity-90 transition-transform duration-500 group-hover:scale-105"
                    src={item.img}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5, ease }}
                  />
                  <div className="pointer-events-none absolute inset-0 viewer-noise opacity-[0.06]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan-line bg-gradient-to-b from-primary/25 via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <motion.div
                    className="absolute left-3 top-3 rounded bg-slate-950/75 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                    initial={{ opacity: 0, x: -8 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    viewport={viewport}
                    whileInView={{ opacity: 1, x: 0 }}
                  >
                    {item.title}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative overflow-hidden border-t border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-background sm:py-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)]" />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          className="relative mx-auto max-w-3xl px-4 text-center sm:px-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={viewport}
          whileInView="visible"
        >
          <motion.h2
            className="text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl"
            variants={fadeInUp}
          >
            Ready to review your next study?
          </motion.h2>
          <motion.p
            className="mt-4 text-base leading-7 text-slate-600 dark:text-muted"
            variants={fadeInUp}
          >
            Open the viewer, upload a ZIP DICOM archive, and start navigating series in seconds.
          </motion.p>
          <motion.div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" variants={fadeInUp}>
            <Button to="/viewer">
              Launch Viewer <FiArrowRight />
            </Button>
            <Button to="/documentation" variant="secondary">
              Read Documentation
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </PageTransition>
  );
}
