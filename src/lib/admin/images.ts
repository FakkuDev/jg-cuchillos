export async function compressAndConvertToWebP(file: File, maxSize: number = 1600): Promise<{ blob: Blob; name: string }> {
  const img = new Image();
  const url = URL.createObjectURL(file);

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  let width = img.width;
  let height = img.height;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      height = (height * maxSize) / width;
      width = maxSize;
    } else {
      width = (width * maxSize) / height;
      height = maxSize;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b as Blob), 'image/webp', 0.85);
  });

  URL.revokeObjectURL(url);

  const cleanName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/\.[^.]+$/, '') + '.webp';

  return { blob, name: cleanName };
}

export function estimateRepoSize(files: { name: string; size: number }[]): string {
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const mb = totalBytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}
