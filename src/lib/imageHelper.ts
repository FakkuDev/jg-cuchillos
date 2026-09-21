export function resolveImage(folder: string, filename: string): string {
  // Las imágenes en public/ se sirven desde la raíz
  return `/${folder}/${filename}`;
}
