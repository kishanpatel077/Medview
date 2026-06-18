import { motion } from 'framer-motion';
import { FiFolderPlus, FiUploadCloud } from 'react-icons/fi';
import Button from './Button.jsx';

export default function UploadZone({ compact = false }) {
  return (
    <motion.div
      className={[
        'rounded-lg border border-dashed border-blue-400/60 bg-blue-500/8 p-5 text-center dark:bg-blue-500/10',
        compact ? 'p-4' : 'sm:p-8',
      ].join(' ')}
      whileHover={{ borderColor: '#3B82F6', y: -2 }}
    >
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-primary text-white shadow-glow">
        <FiUploadCloud size={23} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">Drag and Drop ZIP File</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-muted">
        Select a ZIP DICOM study or upload a DICOM folder for local browser visualization.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" type="button">
          <FiUploadCloud /> Select ZIP File
        </Button>
        <Button className="w-full sm:w-auto" type="button" variant="secondary">
          <FiFolderPlus /> Upload DICOM Folder
        </Button>
      </div>
    </motion.div>
  );
}
