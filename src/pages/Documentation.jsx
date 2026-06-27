import { FiCommand, FiFileText, FiFolder, FiMousePointer, FiUploadCloud } from 'react-icons/fi';
import PageTransition from '../components/PageTransition.jsx';

const sections = [
  {
    icon: FiFileText,
    title: 'Supported Formats',
    rows: ['DICOM files inside ZIP archives', 'DICOM folder uploads', 'CT image series', 'MRI image series', 'X-Ray images'],
  },
  {
    icon: FiUploadCloud,
    title: 'ZIP Upload Guide',
    rows: ['Prepare one DICOM study per ZIP', 'Keep series folders intact', 'Drag the ZIP into the upload area', 'Open the study from Study Explorer'],
  },
  {
    icon: FiFolder,
    title: 'DICOM Structure',
    rows: ['Study contains one or more series', 'Series contains ordered image instances', 'Metadata is read per study, series, and image', 'Slice navigation follows series order'],
  },
  {
    icon: FiMousePointer,
    title: 'Viewer Controls',
    rows: ['Zoom and pan viewport', 'Rotate and reset orientation', 'Adjust window level, brightness, and contrast', 'Invert grayscale display'],
  },
  {
    icon: FiCommand,
    title: 'Keyboard Shortcuts',
    rows: ['Arrow keys navigate slices', 'Plus and minus adjust zoom', 'R resets viewport', 'I toggles invert', 'F opens fullscreen'],
  },
];

export default function Documentation() {
  return (
    <PageTransition className="bg-slate-50 dark:bg-background">
      <section className="mx-auto grid w-full max-w-[1500px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] xl:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Documentation</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white sm:text-5xl">MedView upload and viewer guide</h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-muted">
            A concise reference for supported DICOM study formats, ZIP workflow, viewer controls, and keyboard-driven
            slice review.
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-card"
                key={section.title}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-500/10 text-primary">
                    <Icon />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{section.title}</h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.rows.map((row) => (
                    <div
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
                      key={row}
                    >
                      {row}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PageTransition>
  );
}
