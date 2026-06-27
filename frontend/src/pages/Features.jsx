import { motion } from 'framer-motion';
import {
  FiDatabase,
  FiGrid,
  FiHardDrive,
  FiImage,
  FiLayers,
  FiMonitor,
  FiSmartphone,
  FiUploadCloud,
} from 'react-icons/fi';
import PageTransition from '../components/PageTransition.jsx';

const features = [
  ['ZIP DICOM Upload', 'Upload compressed studies and prepare them for local browser review.', FiUploadCloud],
  ['Browser-Based Viewer', 'Open imaging workflows from a responsive web interface without backend screens.', FiMonitor],
  ['CT Scan Visualization', 'Review axial, coronal, and lung-window style CT study panels.', FiHardDrive],
  ['MRI Visualization', 'Inspect MRI series with clean panel labeling and sequence context.', FiImage],
  ['X-Ray Viewing', 'Display single-image studies in a focused radiology viewport.', FiGrid],
  ['Multi-Series Navigation', 'Move across CT, MRI, and X-Ray series from a structured explorer.', FiLayers],
  ['Metadata Viewer', 'Read study information, series information, and image properties.', FiDatabase],
  ['Responsive Interface', 'Work across mobile, tablet, laptop, desktop, and ultra-wide layouts.', FiSmartphone],
];

export default function Features() {
  return (
    <PageTransition className="bg-white dark:bg-background">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 sm:py-16 xl:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Features</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl xl:text-5xl">
            Lightweight imaging tools for browser-based DICOM review.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-muted">
            MedView is built around upload, visualization, series navigation, and metadata inspection for radiology and
            imaging research workflows.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map(([title, text, Icon], index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-card sm:p-5"
              initial={{ opacity: 0, y: 18 }}
              key={title}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -5 }}
            >
              <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-500/10 text-primary">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-white sm:text-lg">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-muted">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
