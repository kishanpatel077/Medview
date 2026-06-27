import { useState, useEffect, useCallback } from 'react';
import { FiGrid, FiMaximize2, FiMonitor, FiSliders, FiAlertCircle, FiSun, FiDownload, FiImage, FiFileText, FiVideo, FiMenu, FiX, FiZoomIn, FiZoomOut, FiTrash2 } from 'react-icons/fi';
import { TbContrast } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import DicomViewer from '../components/DicomViewer.jsx';
import MetadataPanel from '../components/MetadataPanel.jsx';
import PageTransition from '../components/PageTransition.jsx';
import SeriesPanel from '../components/SeriesPanel.jsx';
import Sidebar from '../components/Sidebar.jsx';
import StudyExplorer from '../components/StudyExplorer.jsx';
import UploadZone from '../components/UploadZone.jsx';
import ViewerToolbar from '../components/ViewerToolbar.jsx';
import Loader from '../components/Loader.jsx';
import { parsePixelSpacing } from '../utils/viewportCoords.js';
import { API_URL } from '../config/api.js';


// Available viewport layouts options
const layouts = [
  { label: 'Single', value: '1', icon: FiMonitor },
  { label: '2-View', value: '2', icon: FiMaximize2 },
];

const LS_STUDY_KEY = 'medview_study';
const LS_SESSION_KEY = 'medview_session';
const LS_FILENAME_KEY = 'medview_filename';

export default function Viewer() {
  // --- STATE MANAGEMENT ---
  const [layout, setLayout] = useState('1');
  const [study, setStudy] = useState(null);
  const [activeSeriesUid, setActiveSeriesUid] = useState(null);
  const [activeSliceIndex, setActiveSliceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // --- IMAGE CONTROLS STATE ---
  const [activeTool, setActiveTool] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState([]);
  const [measurementDraft, setMeasurementDraft] = useState(null);

  // --- EXPORT STATE ---
  const [sessionId, setSessionId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // --- MOBILE SIDEBAR STATE ---
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const resetImageControls = () => {
    setBrightness(100);
    setContrast(100);
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setInvert(false);
    setRotation(0);
    setActiveTool(null);
    setMeasurements([]);
    setMeasurementDraft(null);
  };

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setMeasurementDraft(null);
  }, []);

  const handleMeasurementAdd = useCallback((item) => {
    setMeasurements((prev) => [...prev, item]);
  }, []);

  // --- RESTORE FROM LOCALSTORAGE ON MOUNT ---
  useEffect(() => {
    try {
      const savedStudy = localStorage.getItem(LS_STUDY_KEY);
      const savedSession = localStorage.getItem(LS_SESSION_KEY);
      const savedFileName = localStorage.getItem(LS_FILENAME_KEY);
      if (savedStudy && savedSession) {
        const parsedStudy = JSON.parse(savedStudy);
        setStudy(parsedStudy);
        setSessionId(savedSession);
        setUploadedFileName(savedFileName || '');
        if (parsedStudy.series && parsedStudy.series.length > 0) {
          setActiveSeriesUid(parsedStudy.series[0].seriesInstanceUid);
        }
      }
    } catch (_) {
      localStorage.removeItem(LS_STUDY_KEY);
      localStorage.removeItem(LS_SESSION_KEY);
      localStorage.removeItem(LS_FILENAME_KEY);
    }
  }, []);

  useEffect(() => {
    if (!activeSeriesUid) return;
    resetImageControls();
  }, [activeSeriesUid]);

  useEffect(() => {
    setMeasurements([]);
    setMeasurementDraft(null);
  }, [activeSliceIndex, activeSeriesUid]);

  useEffect(() => {
    if (activeTool !== 'Measurement Tool') {
      setMeasurementDraft(null);
    }
  }, [activeTool]);

  // --- REMOVE STUDY HANDLER ---
  const handleRemoveStudy = () => {
    setStudy(null);
    setSessionId(null);
    setUploadedFileName('');
    setActiveSeriesUid(null);
    setActiveSliceIndex(0);
    localStorage.removeItem(LS_STUDY_KEY);
    localStorage.removeItem(LS_SESSION_KEY);
    localStorage.removeItem(LS_FILENAME_KEY);
  };

  // --- ACTIONS & HANDLERS ---
  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to parse the ZIP file.');
      }

      const data = await response.json();
      if (data.status === 'success' && data.study) {
        setStudy(data.study);
        setSessionId(data.session_id);
        setUploadedFileName(file.name);
        if (data.study.series && data.study.series.length > 0) {
          setActiveSeriesUid(data.study.series[0].seriesInstanceUid);
        }
        setActiveSliceIndex(0);
        // Persist in localStorage so data survives page refresh
        try {
          localStorage.setItem(LS_STUDY_KEY, JSON.stringify(data.study));
          localStorage.setItem(LS_SESSION_KEY, data.session_id);
          localStorage.setItem(LS_FILENAME_KEY, file.name);
        } catch (_) {}
      }
    } catch (e) {
      setError(e.message || 'An error occurred while uploading.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAction = async (format) => {
    if (!study || !sessionId) return;
    setIsExporting(true);
    setExportStatus('Converting...');
    try {
      const seriesParam = activeSeriesUid ? `&series_uid=${activeSeriesUid}` : '';
      const response = await fetch(
        `${API_URL}/api/convert?study_id=${sessionId}&target_format=${format}${seriesParam}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        let errMsg = 'Export failed.';
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      setExportStatus('Downloading...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileExt = format === 'wmv' ? 'wmv' : 'zip';
      a.download = `medview_export_${format}_${sessionId.slice(0, 8)}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      setExportStatus('Done!');
      setTimeout(() => setExportStatus(null), 3000);
    } catch (e) {
      setExportStatus(null);
      alert(e.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATA DERIVATIONS ---
  const activeSeries = study?.series?.find((s) => s.seriesInstanceUid === activeSeriesUid);
  const instances = activeSeries?.instances || [];
  const maxSlices = instances.length;
  const activeSlice = instances[activeSliceIndex] || null;
  const pixelSpacing = parsePixelSpacing(activeSlice?.metadata);

  return (
    <PageTransition className="bg-slate-100 dark:bg-background">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[2400px] flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 xl:px-5">

        {/* ─── TOP HEADER BAR ─── */}
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-dark sm:flex-row sm:items-center sm:justify-between sm:p-4">
          {/* Title */}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">MedView Viewer</p>
            <h1 className="mt-0.5 text-lg font-bold text-slate-950 dark:text-white sm:text-xl xl:text-2xl truncate">
              DICOM Study Workspace
            </h1>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile panel toggles */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 xl:hidden"
              onClick={() => { setShowLeftPanel(!showLeftPanel); setShowRightPanel(false); }}
              type="button"
              title="Toggle Study Panel"
            >
              <FiMenu size={16} />
            </button>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300 xl:hidden"
              onClick={() => { setShowRightPanel(!showRightPanel); setShowLeftPanel(false); }}
              type="button"
              title="Toggle Metadata Panel"
            >
              <FiGrid size={16} />
            </button>

            {/* Layout buttons */}
            <div className="flex items-center gap-1.5">
              {layouts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={[
                      'inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm',
                      layout === item.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                    ].join(' ')}
                    key={item.value}
                    onClick={() => setLayout(item.value)}
                    type="button"
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Export Dropdown Button */}
            <div className="relative">
              <button
                className={[
                  'inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 sm:text-sm',
                  showExportMenu
                    ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/10 dark:text-accent'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  !(study && sessionId) ? 'cursor-not-allowed opacity-50' : '',
                ].join(' ')}
                onClick={() => (study && sessionId) && setShowExportMenu(!showExportMenu)}
                disabled={!(study && sessionId)}
                title={!(study && sessionId) ? 'Upload a DICOM ZIP first to enable export' : 'Export study slices'}
                type="button"
              >
                {isExporting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="hidden sm:inline">{exportStatus || 'Exporting...'}</span>
                  </span>
                ) : (
                  <>
                    <FiDownload size={14} />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </button>

              {/* Export Dropdown Menu */}
              <AnimatePresence>
                {showExportMenu && study && sessionId && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-11 z-50 mt-1 w-60 rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 sm:w-64"
                  >
                    <div className="mb-1.5 border-b border-slate-100 px-2 py-1.5 dark:border-slate-800/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Choose Export Format
                      </p>
                    </div>
                    <div className="space-y-1">
                      {/* PNG */}
                      <button
                        onClick={() => { handleExportAction('png'); setShowExportMenu(false); }}
                        className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-blue-500/5 dark:hover:bg-blue-500/10 group"
                        type="button"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                          <FiImage size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition">PNG Format</span>
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">Lossless</span>
                          </div>
                        </div>
                      </button>
                      {/* JPEG */}
                      <button
                        onClick={() => { handleExportAction('jpeg'); setShowExportMenu(false); }}
                        className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-amber-500/5 dark:hover:bg-amber-500/10 group"
                        type="button"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition">
                          <FiFileText size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition">JPEG Format</span>
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">Small Size</span>
                          </div>
                        </div>
                      </button>
                      {/* WMV */}
                      <button
                        onClick={() => { handleExportAction('wmv'); setShowExportMenu(false); }}
                        className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition hover:bg-purple-500/5 dark:hover:bg-purple-500/10 group"
                        type="button"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition">
                          <FiVideo size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-500 transition">WMV Video</span>
                            <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">10 FPS</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ─── ERROR ALERT ─── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 sm:p-4">
            <FiAlertCircle size={18} className="shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}

        {/* ─── MAIN WORKSPACE ─── */}
        {/* Desktop: 3-column grid | Mobile: single column with panel overlays */}
        <div className="relative flex flex-1 gap-3 xl:grid xl:grid-cols-[250px_minmax(0,1fr)_270px] 3xl:grid-cols-[300px_minmax(0,1fr)_320px]">

          {/* ── LEFT PANEL ── Study Explorer, Series Nav, Upload, Export */}
          {/* Mobile: slide-in overlay */}
          <AnimatePresence>
            {showLeftPanel && (
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-white pb-6 pt-16 shadow-2xl dark:bg-dark xl:hidden"
              >
                <button
                  className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-md border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  onClick={() => setShowLeftPanel(false)}
                  type="button"
                >
                  <FiX size={16} />
                </button>
                <div className="grid gap-3 px-3">
                  <Sidebar>
                    <StudyExplorer
                      study={study}
                      activeSeriesUid={activeSeriesUid}
                      onSelectSeries={(uid) => { setActiveSeriesUid(uid); setActiveSliceIndex(0); setShowLeftPanel(false); }}
                    />
                  </Sidebar>
                  <SeriesPanel
                    seriesList={study?.series}
                    activeSeriesUid={activeSeriesUid}
                    onSelectSeries={(uid) => { setActiveSeriesUid(uid); setActiveSliceIndex(0); setShowLeftPanel(false); }}
                  />
                  <UploadZone
                    compact
                    onUpload={(f) => { handleUpload(f); setShowLeftPanel(false); }}
                    studyLoaded={!!study}
                    fileName={uploadedFileName}
                    onRemove={() => { handleRemoveStudy(); setShowLeftPanel(false); }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop left column */}
          <div className="hidden xl:grid xl:content-start xl:gap-3">
            <Sidebar>
              <StudyExplorer
                study={study}
                activeSeriesUid={activeSeriesUid}
                onSelectSeries={(uid) => { setActiveSeriesUid(uid); setActiveSliceIndex(0); }}
              />
            </Sidebar>
            <SeriesPanel
              seriesList={study?.series}
              activeSeriesUid={activeSeriesUid}
              onSelectSeries={(uid) => { setActiveSeriesUid(uid); setActiveSliceIndex(0); }}
            />
            <UploadZone
              compact
              onUpload={handleUpload}
              studyLoaded={!!study}
              fileName={uploadedFileName}
              onRemove={handleRemoveStudy}
            />
          </div>

          {/* ── CENTER COLUMN ── Viewer + Toolbar */}
          <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-dark sm:p-3">
            {/* Toolbar */}
            <ViewerToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              brightness={brightness}
              contrast={contrast}
              zoom={zoom}
              invert={invert}
              setInvert={setInvert}
              rotation={rotation}
              setRotation={setRotation}
              onReset={resetImageControls}
              measurementCount={measurements.length}
            />

            {activeTool === 'Measurement Tool' && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 dark:border-sky-900/40 dark:bg-sky-950/20 sm:mt-2.5">
                <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                  Click <strong>two points</strong> on the image to measure distance.
                  {pixelSpacing ? ' Result shown in mm using DICOM pixel spacing.' : ' Result shown in pixels (upload DICOM for mm).'}
                </p>
                {measurements.length > 0 && (
                  <button
                    type="button"
                    onClick={clearMeasurements}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <FiTrash2 size={13} />
                    Clear ({measurements.length})
                  </button>
                )}
              </div>
            )}

            {/* Brightness Slider */}
            {activeTool === 'Brightness' && (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-darkSecondary sm:mt-2.5 sm:p-3">
                <FiSun className="shrink-0 text-primary" />
                <span className="w-28 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Brightness: {brightness}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="range min-w-[120px] flex-1"
                />
              </div>
            )}

            {/* Contrast Slider */}
            {activeTool === 'Contrast' && (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-darkSecondary sm:mt-2.5 sm:p-3">
                <TbContrast className="shrink-0 text-primary" />
                <span className="w-28 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contrast: {contrast}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="range min-w-[120px] flex-1"
                />
              </div>
            )}

            {/* Zoom Slider */}
            {activeTool === 'Zoom' && (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-darkSecondary sm:mt-2.5 sm:p-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(25, z - 10))}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                  title="Zoom Out"
                >
                  <FiZoomOut size={16} />
                </button>
                <FiZoomIn className="shrink-0 text-primary" />
                <span className="w-24 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Zoom: {zoom}%
                </span>
                <input
                  type="range"
                  min="25"
                  max="400"
                  step="5"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="range min-w-[120px] flex-1"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(400, z + 10))}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
                  title="Zoom In"
                >
                  <FiZoomIn size={16} />
                </button>
              </div>
            )}

            {/* DICOM Viewer */}
            <div className="mt-2 sm:mt-3">
              {isLoading ? (
                <div className="flex h-[280px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-950 sm:h-[360px] xl:h-[400px]">
                  <Loader />
                  <p className="text-sm text-slate-400">Extracting ZIP and parsing DICOM files...</p>
                </div>
              ) : (
                <DicomViewer
                  layout={layout}
                  seriesList={study?.series}
                  activeSeriesUid={activeSeriesUid}
                  activeSliceIndex={activeSliceIndex}
                  brightness={brightness}
                  contrast={contrast}
                  invert={invert}
                  rotation={rotation}
                  zoom={zoom}
                  pan={pan}
                  interactive
                  activeTool={activeTool}
                  onPanChange={setPan}
                  onZoomChange={setZoom}
                  measurements={measurements}
                  measurementDraft={measurementDraft}
                  onMeasurementDraftChange={setMeasurementDraft}
                  onMeasurementAdd={handleMeasurementAdd}
                  pixelSpacing={pixelSpacing}
                />
              )}
            </div>

            {/* Slice Navigation */}
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-darkSecondary sm:mt-4 sm:p-4">
              <div className="mb-2 flex flex-col gap-1.5 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                  <FiSliders className="text-primary" />
                  Slice Navigation
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-muted">
                  Frame {maxSlices > 0 ? activeSliceIndex + 1 : 0} of {maxSlices}
                </div>
              </div>
              <input
                aria-label="Slice navigation"
                className="range"
                max={maxSlices > 0 ? maxSlices : 1}
                min={1}
                type="range"
                value={maxSlices > 0 ? activeSliceIndex + 1 : 1}
                onChange={(e) => setActiveSliceIndex(parseInt(e.target.value) - 1)}
                disabled={maxSlices <= 1}
              />
              <div className="mt-2 grid grid-cols-3 text-xs text-slate-500 dark:text-muted sm:mt-3">
                <span>Image 001</span>
                <span className="text-center">Frame Navigation</span>
                <span className="text-right">
                  Image {maxSlices > 0 ? String(maxSlices).padStart(3, '0') : '000'}
                </span>
              </div>
            </div>
          </section>

          {/* ── RIGHT PANEL ── Metadata */}
          {/* Mobile: slide-in overlay */}
          <AnimatePresence>
            {showRightPanel && (
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 right-0 z-40 w-72 overflow-y-auto bg-white pb-6 pt-16 shadow-2xl dark:bg-dark xl:hidden"
              >
                <button
                  className="absolute left-3 top-4 grid h-8 w-8 place-items-center rounded-md border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  onClick={() => setShowRightPanel(false)}
                  type="button"
                >
                  <FiX size={16} />
                </button>
                <div className="px-3">
                  <Sidebar>
                    <MetadataPanel activeSlice={activeSlice} />
                  </Sidebar>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop right column */}
          <div className="hidden xl:block xl:content-start">
            <Sidebar>
              <MetadataPanel activeSlice={activeSlice} />
            </Sidebar>
          </div>
        </div>

        {/* Mobile backdrop overlay */}
        <AnimatePresence>
          {(showLeftPanel || showRightPanel) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm xl:hidden"
              onClick={() => { setShowLeftPanel(false); setShowRightPanel(false); }}
            />
          )}
        </AnimatePresence>

        {/* Mobile quick-access upload strip */}
        <div className="xl:hidden">
          <UploadZone
            compact
            onUpload={handleUpload}
            studyLoaded={!!study}
            fileName={uploadedFileName}
            onRemove={handleRemoveStudy}
          />
        </div>
      </div>
    </PageTransition>
  );
}
