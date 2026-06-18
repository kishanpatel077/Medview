import { FiActivity, FiGithub, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Viewer', to: '/viewer' },
  { label: 'Features', to: '/features' },
  { label: 'Documentation', to: '/documentation' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-dark">
      <div className="mx-auto grid w-full max-w-[1920px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] xl:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white">
              <FiActivity />
            </span>
            <div>
              <p className="font-bold text-slate-950 dark:text-white">MedView</p>
              <p className="text-sm text-slate-500 dark:text-muted">Modern Web-Based DICOM Viewer</p>
            </div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-muted">
            Upload ZIP DICOM studies, view medical images, and analyze CT, MRI, and X-Ray data directly in your
            browser.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted">
            Product
          </p>
          <div className="grid gap-2">
            {footerLinks.map((link) => (
              <Link
                className="text-sm text-slate-600 transition hover:text-primary dark:text-slate-300 dark:hover:text-accent"
                key={link.to}
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted">
            Workspace
          </p>
          <div className="flex gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <FiMail />
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <FiGithub />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
