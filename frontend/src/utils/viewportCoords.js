export function parsePixelSpacing(metadata) {
  if (!metadata) return null;
  const row = metadata.find(([label]) => label === 'Spacing');
  if (!row || !row[1] || row[1] === 'N/A') return null;

  const nums = String(row[1]).match(/[\d.]+/g);
  if (!nums || nums.length < 2) return null;

  const rowSpacing = parseFloat(nums[0]);
  const colSpacing = parseFloat(nums[1]);
  if (!Number.isFinite(rowSpacing) || !Number.isFinite(colSpacing)) return null;

  return { row: rowSpacing, col: colSpacing };
}

export function getImageMetrics(viewportSize, zoom) {
  const { cw, ch, nw, nh } = viewportSize;
  if (!cw || !ch || !nw || !nh) return null;

  const fitScale = Math.min(cw / nw, ch / nh);
  const scale = fitScale * (zoom / 100);

  return {
    fitScale,
    scale,
    displayW: nw * scale,
    displayH: nh * scale,
    centerX: cw / 2,
    centerY: ch / 2,
    nw,
    nh,
  };
}

export function containerToImage(containerX, containerY, viewportSize, zoom, pan, rotation) {
  const metrics = getImageMetrics(viewportSize, zoom);
  if (!metrics) return { x: 0, y: 0 };

  const { scale, centerX, centerY, nw, nh } = metrics;
  let dx = containerX - (centerX + pan.x);
  let dy = containerY - (centerY + pan.y);

  if (rotation) {
    const rad = (-rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    dx = rx;
    dy = ry;
  }

  return {
    x: dx / scale + nw / 2,
    y: dy / scale + nh / 2,
  };
}

export function imageToContainer(imgX, imgY, viewportSize, zoom, pan, rotation) {
  const metrics = getImageMetrics(viewportSize, zoom);
  if (!metrics) return { x: 0, y: 0 };

  const { scale, centerX, centerY, nw, nh } = metrics;
  let dx = (imgX - nw / 2) * scale;
  let dy = (imgY - nh / 2) * scale;

  if (rotation) {
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    dx = rx;
    dy = ry;
  }

  return {
    x: centerX + pan.x + dx,
    y: centerY + pan.y + dy,
  };
}

export function calculateMeasurement(start, end, pixelSpacing) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthPx = Math.sqrt(dx * dx + dy * dy);

  if (!pixelSpacing) {
    return {
      lengthPx,
      lengthMm: null,
      label: `${lengthPx.toFixed(1)} px`,
    };
  }

  const mmX = dx * pixelSpacing.col;
  const mmY = dy * pixelSpacing.row;
  const lengthMm = Math.sqrt(mmX * mmX + mmY * mmY);

  return {
    lengthPx,
    lengthMm,
    label: `${lengthMm.toFixed(2)} mm`,
  };
}
