import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MeasurementOverlay from './MeasurementOverlay.jsx';
import {
  calculateMeasurement,
  containerToImage,
} from '../utils/viewportCoords.js';
import ctAxial from '../assets/ct_axial.png';
import mriSag from '../assets/mri_sag.png';
import xrChest from '../assets/xr_chest.png';
import ctCor from '../assets/ct_cor.png';

const defaultPanels = [
  { title: 'CT AXIAL', img: ctAxial, meta: 'S: 128 / 312', accent: 'text-blue-300' },
  { title: 'MRI SAG', img: mriSag, meta: 'T2 FLAIR', accent: 'text-cyan-300' },
  { title: 'XR CHEST', img: xrChest, meta: 'PA VIEW', accent: 'text-emerald-300' },
  { title: 'CT COR', img: ctCor, meta: 'MPR', accent: 'text-indigo-300' },
];

const MIN_VISIBLE_RATIO = 0.3;

function clampZoom(value) {
  return Math.min(400, Math.max(25, value));
}

function getDisplaySize(naturalW, naturalH, containerW, containerH, zoom) {
  const fitScale = Math.min(containerW / naturalW, containerH / naturalH);
  const zoomScale = zoom / 100;
  return {
    w: naturalW * fitScale * zoomScale,
    h: naturalH * fitScale * zoomScale,
  };
}

function getRotatedBounds(width, height, rotation) {
  const rad = ((rotation % 360) + 360) % 360 * (Math.PI / 180);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    w: width * cos + height * sin,
    h: width * sin + height * cos,
  };
}

function clampPanToBounds(pan, containerW, containerH, naturalW, naturalH, zoom, rotation) {
  if (!containerW || !containerH || !naturalW || !naturalH) {
    return pan;
  }

  if (zoom <= 100) {
    return { x: 0, y: 0 };
  }

  const { w, h } = getDisplaySize(naturalW, naturalH, containerW, containerH, zoom);
  const { w: boundW, h: boundH } = getRotatedBounds(w, h, rotation);

  const minVisW = Math.min(boundW, Math.max(boundW * MIN_VISIBLE_RATIO, 48));
  const minVisH = Math.min(boundH, Math.max(boundH * MIN_VISIBLE_RATIO, 48));

  const panMinX = minVisW - containerW / 2 - boundW / 2;
  const panMaxX = containerW / 2 - minVisW + boundW / 2;
  const panMinY = minVisH - containerH / 2 - boundH / 2;
  const panMaxY = containerH / 2 - minVisH + boundH / 2;

  return {
    x: Math.min(panMaxX, Math.max(panMinX, pan.x)),
    y: Math.min(panMaxY, Math.max(panMinY, pan.y)),
  };
}

function ScanPanel({
  title,
  img,
  meta,
  active,
  index,
  isDemo,
  brightness = 100,
  contrast = 100,
  invert = false,
  rotation = 0,
  zoom = 100,
  pan = { x: 0, y: 0 },
  interactive = false,
  activeTool = null,
  onPanChange,
  onZoomChange,
  measurements = [],
  measurementDraft = null,
  onMeasurementDraftChange,
  onMeasurementAdd,
  pixelSpacing = null,
}) {
  const backendUrl = 'http://127.0.0.1:8000';
  const imageUrl = isDemo ? img : (img ? `${backendUrl}${img}` : null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewportSize, setViewportSize] = useState({ cw: 0, ch: 0, nw: 0, nh: 0 });

  const canPan = interactive && zoom > 100 && activeTool !== 'Measurement Tool';
  const canZoom = interactive && activeTool === 'Zoom';
  const isMeasuring = interactive && activeTool === 'Measurement Tool' && active;

  const measureViewport = useCallback(() => {
    const container = containerRef.current;
    const image = imgRef.current;
    if (!container) return;

    setViewportSize((prev) => ({
      cw: container.clientWidth,
      ch: container.clientHeight,
      nw: image?.naturalWidth || prev.nw,
      nh: image?.naturalHeight || prev.nh,
    }));
  }, []);

  const clampPan = useCallback(
    (nextPan, nextZoom = zoom) =>
      clampPanToBounds(
        nextPan,
        viewportSize.cw,
        viewportSize.ch,
        viewportSize.nw,
        viewportSize.nh,
        nextZoom,
        rotation,
      ),
    [viewportSize, zoom, rotation],
  );

  const applyPan = useCallback(
    (nextPan, nextZoom = zoom) => {
      if (!onPanChange) return;
      onPanChange(clampPan(nextPan, nextZoom));
    },
    [clampPan, onPanChange, zoom],
  );

  const applyZoom = useCallback(
    (nextZoom, nextPan = pan) => {
      const clampedZoom = clampZoom(nextZoom);
      const clampedPan = clampPan(nextPan, clampedZoom);
      onPanChange?.(clampedPan);
      onZoomChange?.(clampedZoom);
    },
    [clampPan, onPanChange, onZoomChange, pan],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    measureViewport();
    const observer = new ResizeObserver(measureViewport);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureViewport, imageUrl]);

  useEffect(() => {
    if (!interactive || !onPanChange || !viewportSize.cw) return;
    const clamped = clampPan(pan, zoom);
    if (clamped.x !== pan.x || clamped.y !== pan.y) {
      onPanChange(clamped);
    }
  }, [zoom, rotation, viewportSize, interactive, onPanChange, clampPan, pan]);

  const handleWheel = useCallback(
    (e) => {
      if (!canZoom) return;
      e.preventDefault();
      e.stopPropagation();

      const el = containerRef.current;
      if (!el || !onZoomChange || !onPanChange) return;

      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const oldScale = zoom / 100;
      const delta = e.deltaY < 0 ? 10 : -10;
      const newZoom = clampZoom(zoom + delta);
      const newScale = newZoom / 100;
      const ratio = newScale / oldScale;

      applyZoom(newZoom, {
        x: pan.x + (mx - cx - pan.x) * (1 - ratio),
        y: pan.y + (my - cy - pan.y) * (1 - ratio),
      });
    },
    [canZoom, applyZoom, pan.x, pan.y, zoom],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isMeasuring && measurementDraft?.start && onMeasurementDraftChange) {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const end = containerToImage(
          e.clientX - rect.left,
          e.clientY - rect.top,
          viewportSize,
          zoom,
          pan,
          rotation,
        );
        const preview = calculateMeasurement(measurementDraft.start, end, pixelSpacing);
        onMeasurementDraftChange({
          start: measurementDraft.start,
          end,
          label: preview.label,
        });
        return;
      }

      const drag = dragRef.current;
      if (!drag || !onPanChange) return;
      applyPan({
        x: drag.panX + (e.clientX - drag.startX),
        y: drag.panY + (e.clientY - drag.startY),
      });
    },
    [
      applyPan,
      isMeasuring,
      measurementDraft,
      onMeasurementDraftChange,
      onPanChange,
      pan,
      pixelSpacing,
      rotation,
      viewportSize,
      zoom,
    ],
  );

  useEffect(() => {
    if (!interactive) return undefined;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', endDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', endDrag);
    };
  }, [interactive, handleMouseMove, endDrag, isMeasuring]);

  const handleMeasurementClick = (e) => {
    if (!isMeasuring || !onMeasurementDraftChange || !onMeasurementAdd) return;

    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const point = containerToImage(
      e.clientX - rect.left,
      e.clientY - rect.top,
      viewportSize,
      zoom,
      pan,
      rotation,
    );

    if (!measurementDraft?.start) {
      onMeasurementDraftChange({ start: point, end: point, label: null });
      return;
    }

    const result = calculateMeasurement(measurementDraft.start, point, pixelSpacing);
    onMeasurementAdd({
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      start: measurementDraft.start,
      end: point,
      lengthPx: result.lengthPx,
      lengthMm: result.lengthMm,
      label: result.label,
    });
    onMeasurementDraftChange(null);
  };

  const handleMouseDown = (e) => {
    if (isMeasuring) {
      e.preventDefault();
      handleMeasurementClick(e);
      return;
    }

    if (!canPan || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const cursorClass = isMeasuring
    ? 'cursor-crosshair'
    : canPan
      ? isDragging
        ? 'cursor-grabbing'
        : 'cursor-grab'
      : canZoom
        ? 'cursor-zoom-in'
        : '';

  const imageStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : 'invert(0)'}`,
    transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom / 100}) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'filter 0.05s ease-out',
  };

  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.72 }}
      className={`relative min-h-[200px] overflow-hidden rounded-md border ${
        active ? 'border-primary' : 'border-slate-700'
      } bg-slate-950 scan-grid sm:min-h-[260px] lg:min-h-[320px] xl:min-h-[360px] 3xl:min-h-[520px]`}
      whileHover={interactive ? undefined : { scale: 1.005 }}
    >
      <div className="absolute left-3 top-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-white">
        {title || `Viewport ${index + 1}`}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded bg-slate-950/75 px-2 py-1 text-[11px] font-semibold text-muted">
        {meta}
      </div>
      <div
        ref={containerRef}
        className={`absolute inset-x-2 bottom-2 top-10 overflow-hidden rounded-md border border-slate-600/60 bg-slate-900 ${cursorClass}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
      >
        {imageUrl ? (
          <img
            ref={imgRef}
            src={imageUrl}
            alt={title}
            className="absolute left-1/2 top-1/2 max-h-full max-w-full select-none object-contain opacity-90"
            style={imageStyle}
            draggable={false}
            onLoad={measureViewport}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">No Image Data</div>
        )}
        <MeasurementOverlay
          draft={isMeasuring ? measurementDraft : null}
          measurements={active ? measurements : []}
          pan={pan}
          rotation={rotation}
          viewportSize={viewportSize}
          zoom={zoom}
        />
        <div className="pointer-events-none absolute inset-0 viewer-noise opacity-[0.06]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-blue-300/20" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-blue-300/20" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-muted">
        <span>512 x 512</span>
        <span className="text-primary font-semibold">DICOM</span>
      </div>
    </motion.div>
  );
}

export default function DicomViewer({
  layout = '1',
  seriesList = [],
  activeSeriesUid,
  activeSliceIndex = 0,
  brightness = 100,
  contrast = 100,
  invert = false,
  rotation = 0,
  zoom = 100,
  pan = { x: 0, y: 0 },
  interactive = false,
  activeTool = null,
  onPanChange,
  onZoomChange,
  measurements = [],
  measurementDraft = null,
  onMeasurementDraftChange,
  onMeasurementAdd,
  pixelSpacing = null,
}) {
  const activeSeries = seriesList?.find((s) => s.seriesInstanceUid === activeSeriesUid);
  const isDemoMode = !activeSeries || !activeSeries.instances || activeSeries.instances.length === 0;

  const numPanels = layout === '1' ? 1 : layout === '2' ? 2 : 4;
  const gridClass =
    layout === '1'
      ? 'grid-cols-1'
      : layout === '2'
        ? 'grid-cols-1 xl:grid-cols-2'
        : 'grid-cols-1 md:grid-cols-2';

  const panelProps = {
    brightness,
    contrast,
    invert,
    rotation,
    zoom,
    pan,
    interactive,
    activeTool,
    onPanChange,
    onZoomChange,
    measurements,
    measurementDraft,
    onMeasurementDraftChange,
    onMeasurementAdd,
    pixelSpacing,
  };

  if (isDemoMode) {
    const visiblePanels = defaultPanels.slice(0, numPanels);
    return (
      <div className={`grid gap-3 ${gridClass}`}>
        {visiblePanels.map((panel, index) => (
          <ScanPanel
            key={panel.title}
            index={index}
            title={panel.title}
            img={panel.img}
            meta={panel.meta}
            active={index === 0}
            isDemo={true}
            {...panelProps}
          />
        ))}
      </div>
    );
  }

  const instances = activeSeries.instances;
  const viewports = [];
  for (let i = 0; i < numPanels; i++) {
    const sliceIdx = (activeSliceIndex + i) % instances.length;
    const instance = instances[sliceIdx];
    viewports.push({
      title: `${activeSeries.seriesDescription || 'Series'} - Slice ${instance.instanceNumber}`,
      img: instance.imageUrl,
      meta: `Frame ${sliceIdx + 1} of ${instances.length}`,
      active: i === 0,
    });
  }

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {viewports.map((panel, index) => (
        <ScanPanel
          key={index}
          index={index}
          title={panel.title}
          img={panel.img}
          meta={panel.meta}
          active={panel.active}
          isDemo={false}
          {...panelProps}
        />
      ))}
    </div>
  );
}
