import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import Button from './Button.jsx';

export default function UploadZone({ compact = false, onUpload, studyLoaded = false, fileName = '', onRemove }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
    e.target.value = '';
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ── Loaded state: show file name + Remove button ──
  if (studyLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={[
          'rounded-lg border border-green-400/50 bg-green-500/[0.06] text-center dark:bg-green-500/10',
          compact ? 'p-4' : 'p-5 sm:p-8',
        ].join(' ')}
      >
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-green-500 text-white shadow-md">
          <FiCheckCircle size={21} />
        </div>
        <h3 className={`mt-3 font-semibold text-green-700 dark:text-green-400 ${compact ? 'text-sm' : 'text-base'}`}>
          ZIP Loaded
        </h3>
        {fileName && (
          <p className="mt-1 truncate px-2 text-[11px] text-slate-500 dark:text-muted" title={fileName}>
            {fileName}
          </p>
        )}
        <div className={`flex justify-center ${compact ? 'mt-3' : 'mt-4 sm:mt-5'}`}>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 sm:w-auto"
          >
            <FiTrash2 size={13} />
            Remove ZIP
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Default upload state ──
  return (
    <motion.div
      className={[
        'rounded-lg border border-dashed border-blue-400/60 bg-blue-500/[0.06] text-center dark:bg-blue-500/10',
        compact ? 'p-4' : 'p-5 sm:p-8',
      ].join(' ')}
      whileHover={{ borderColor: '#3B82F6', y: -2 }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".zip"
        className="hidden"
      />
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-primary text-white shadow-glow">
        <FiUploadCloud size={21} />
      </div>
      <h3 className={`mt-3 font-semibold text-slate-950 dark:text-white ${compact ? 'text-sm' : 'text-base'}`}>
        {compact ? 'Upload ZIP File' : 'Drag and Drop ZIP File'}
      </h3>
      {!compact && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-muted">
          Select a ZIP DICOM study for local browser visualization.
        </p>
      )}
      <div className={`flex justify-center ${compact ? 'mt-3' : 'mt-4 sm:mt-5'}`}>
        <Button className="w-full justify-center sm:w-auto" type="button" onClick={triggerFileSelect}>
          <FiUploadCloud size={15} />
          {compact ? 'Select ZIP' : 'Select ZIP File'}
        </Button>
      </div>
    </motion.div>
  );
}
