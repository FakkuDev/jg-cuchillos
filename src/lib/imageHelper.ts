const modules = import.meta.glob('../assets/**/*.{webp,avif,jpg,jpeg,png}', { eager: true });

const fallbackSVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23F9F7F2"/><path d="M60 200 L340 200 L320 180 L60 180 Z" fill="%23D1D5DB"/><path d="M340 200 L370 220 L340 240 Z" fill="%239CA3AF"/><rect x="30" y="170" width="40" height="60" fill="%238B4513" rx="4"/></svg>';

export function resolveImage(folder: 'cuchillos' | 'galeria' | 'taller', filename: string) {
  const cleanName = filename.replace(/\.[^/.]+$/, '').toLowerCase() + '.webp';
  const path = `../assets/${folder}/${cleanName}`;

  if (modules[path]) {
    return (modules[path] as any).default;
  }
  return fallbackSVG;
}
