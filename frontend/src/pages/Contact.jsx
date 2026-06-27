import { FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import Button from '../components/Button.jsx';
import PageTransition from '../components/PageTransition.jsx';

export default function Contact() {
  return (
    <PageTransition className="bg-white dark:bg-background">
      <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16 xl:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: Info */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl xl:text-5xl">
              Talk to the MedView team
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-muted">
              Share imaging workflow questions, research use cases, or frontend integration requirements.
            </p>
            <div className="mt-8 grid gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-card">
                <FiMail className="shrink-0 text-primary" />
                <span className="min-w-0 break-all text-sm text-slate-700 dark:text-slate-300">
                  contact@medview.example
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-card">
                <FiMapPin className="shrink-0 text-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Browser-based imaging workspace</span>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <form className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Name
                <input
                  className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="Your name"
                  type="text"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
                <input
                  className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  placeholder="you@example.com"
                  type="email"
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Organization
              <input
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Imaging lab, clinic, or research group"
                type="text"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Message
              <textarea
                className="min-h-32 resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-950 outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:min-h-36"
                placeholder="Tell us about your DICOM viewing workflow"
              />
            </label>
            <Button className="mt-5 w-full justify-center sm:w-auto" type="button">
              <FiSend /> Send Message
            </Button>
          </form>
        </div>
      </section>
    </PageTransition>
  );
}
