import { useState } from 'react';
import { FiDownload, FiInfo, FiFileText } from 'react-icons/fi';
import Button from './Button.jsx';
import Loader from './Loader.jsx';
import { API_URL } from '../config/api.js';

export default function ExportPanel({ study, sessionId, activeSeriesUid }) {
  const [exportFormat, setExportFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleExport = async () => {
    if (!study || !sessionId) return;
    setIsExporting(true);
    setStatus('Converting files...');
    try {
      const seriesParam = activeSeriesUid ? `&series_uid=${activeSeriesUid}` : '';
      const response = await fetch(
        `${API_URL}/api/convert?study_id=${sessionId}&target_format=${exportFormat}${seriesParam}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to convert and export study.');
      }

      setStatus(exportFormat === 'wmv' ? 'Downloading video...' : 'Downloading ZIP archive...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileExt = exportFormat === 'wmv' ? 'wmv' : 'zip';
      a.download = `medview_export_${exportFormat}_${sessionId.slice(0, 8)}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setStatus('Export complete!');
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      alert(e.message || 'Export failed.');
      setStatus(null);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-darkSecondary sm:p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
        <FiDownload className="shrink-0 text-primary" />
        Export &amp; Convert
      </h3>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-muted sm:text-xs">
        Export DICOM slices to web-friendly image/video archives.
      </p>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            className={[
              'flex flex-col items-center justify-center rounded-md border py-2.5 px-1 text-center transition',
              exportFormat === 'png'
                ? 'border-primary bg-primary/5 text-primary dark:border-accent dark:bg-accent/5 dark:text-accent font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-medium',
              !(study && sessionId) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
            onClick={() => study && sessionId && setExportFormat('png')}
            disabled={!(study && sessionId)}
          >
            <span className="text-xs">PNG</span>
            <span className="text-[8px] mt-0.5 opacity-80">Lossless</span>
          </button>
          <button
            type="button"
            className={[
              'flex flex-col items-center justify-center rounded-md border py-2.5 px-1 text-center transition',
              exportFormat === 'jpeg'
                ? 'border-primary bg-primary/5 text-primary dark:border-accent dark:bg-accent/5 dark:text-accent font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-medium',
              !(study && sessionId) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
            onClick={() => study && sessionId && setExportFormat('jpeg')}
            disabled={!(study && sessionId)}
          >
            <span className="text-xs">JPEG</span>
            <span className="text-[8px] mt-0.5 opacity-80">Small</span>
          </button>
          <button
            type="button"
            className={[
              'flex flex-col items-center justify-center rounded-md border py-2.5 px-1 text-center transition',
              exportFormat === 'wmv'
                ? 'border-primary bg-primary/5 text-primary dark:border-accent dark:bg-accent/5 dark:text-accent font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 font-medium',
              !(study && sessionId) ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
            onClick={() => study && sessionId && setExportFormat('wmv')}
            disabled={!(study && sessionId)}
          >
            <span className="text-xs">WMV</span>
            <span className="text-[8px] mt-0.5 opacity-80">Video</span>
          </button>
        </div>

        <div className="rounded bg-slate-50 p-2 dark:bg-slate-900/60 text-[10px] text-slate-600 dark:text-muted flex items-start gap-1.5">
          <FiInfo className="mt-0.5 text-primary shrink-0" size={13} />
          <span>
            {exportFormat === 'png' && 'PNG preserves full pixel clarity and supports transparent layouts. Ideal for archival storage.'}
            {exportFormat === 'jpeg' && 'JPEG compresses slice images into a smaller ZIP package. Ideal for slides and reports.'}
            {exportFormat === 'wmv' && 'WMV renders series slices into a Windows Media Video at 10 FPS. Ideal for movie playback.'}
          </span>
        </div>

        <div className="pt-1">
          {isExporting ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-600 dark:text-muted">
              <Loader size="sm" />
              <span>{status}</span>
            </div>
          ) : (
            <Button
              className="w-full justify-center"
              onClick={handleExport}
              disabled={!(study && sessionId) || isExporting}
              type="button"
            >
              <FiFileText /> Export Series
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
