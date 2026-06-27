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
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800/60 dark:bg-gradient-to-b dark:from-dark dark:to-[#070b13]">
      <div className="mx-auto grid w-full max-w-[1920px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] xl:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white shadow-glow">
              <FiActivity size={18} />
            </span>
            <div>
              <p className="font-bold text-slate-950 dark:text-white tracking-wide">MedView</p>
              <p className="text-xs text-slate-500 dark:text-muted">Modern Web-Based DICOM Viewer</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-muted">
            Securely upload ZIP DICOM studies, view medical images, and analyze CT, MRI, and X-Ray data directly in your browser. All processing is transient or local to ensure patient privacy.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted">
            Product
          </p>
          <div className="grid gap-2">
            {footerLinks.map((link) => (
              <Link
                className="w-fit text-sm text-slate-600 transition hover:text-primary dark:text-slate-300 dark:hover:text-accent"
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
            Connect With Us
          </p>
          <p className="text-sm text-slate-600 dark:text-muted mb-4">
            Have questions or feedback? Get in touch with our team.
          </p>
          <div className="flex gap-3">
            <a
              href="mailto:support@medview.com"
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:bg-primary hover:text-white dark:border-slate-700 dark:text-slate-300 dark:hover:border-accent dark:hover:bg-accent/10 dark:hover:text-accent"
              title="Email Support"
            >
              <FiMail size={18} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:bg-primary hover:text-white dark:border-slate-700 dark:text-slate-300 dark:hover:border-accent dark:hover:bg-accent/10 dark:hover:text-accent"
              title="GitHub Repository"
            >
              <FiGithub size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-200/80 bg-slate-50 dark:border-slate-800/40 dark:bg-dark/40">
        <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 px-4 py-6 text-center text-xs text-slate-500 dark:text-muted sm:px-6 sm:flex-row sm:justify-between sm:text-left xl:px-8">
          <p>© {new Date().getFullYear()} MedView. All rights reserved. Local browser visualization tool.</p>
          <div className="flex justify-center gap-4 sm:justify-start">
            <span className="cursor-pointer hover:text-primary dark:hover:text-accent">Privacy Policy</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-primary dark:hover:text-accent">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

