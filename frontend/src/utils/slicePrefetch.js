import { API_URL } from '../config/api.js';

export function resolveSliceUrl(imagePath, isDemo = false) {
  if (!imagePath) return null;
  return isDemo ? imagePath : `${API_URL}${imagePath}`;
}

export function prefetchSliceUrls(urls = []) {
  urls.filter(Boolean).forEach((url) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
  });
}

export function getPrefetchUrls(instances = [], centerIndex = 0, radius = 4, isDemo = false) {
  if (!instances.length) return [];

  const urls = [];
  for (let offset = -radius; offset <= radius; offset += 1) {
    const index = centerIndex + offset;
    if (index < 0 || index >= instances.length) continue;
    const url = resolveSliceUrl(instances[index]?.imageUrl, isDemo);
    if (url) urls.push(url);
  }
  return urls;
}
