import { h } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { compressAndConvertToWebP, estimateRepoSize } from '../../lib/admin/images';

interface Props {
  onFilesReady: (files: { name: string; blob: Blob }[]) => void;
  existingFiles: string[];
}

export default function PhotoManager({ onFilesReady, existingFiles }: Props) {
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    setStatus('Procesando imágenes...');
    const processed: { name: string; blob: Blob }[] = [];
    const fileInfos: { name: string; size: number }[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const { blob, name } = await compressAndConvertToWebP(file);
        processed.push({ name, blob });
        fileInfos.push({ name, size: blob.size });
      } catch (err) {
        console.error('Error procesando', file.name, err);
      }
    }

    setFiles(fileInfos);
    onFilesReady(processed);
    setStatus(`${processed.length} imágenes listas para subir.`);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer?.files || null);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const missingPhotos = files.filter(f => !existingFiles.includes(f.name));
  const totalSize = estimateRepoSize(files);

  return (
    <div class="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        class={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-cognac bg-cognac/5' : 'border-gray-300 hover:border-cognac'
        }`}
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="mt-2 text-sm text-gray-600">Arrastrá fotos acá o hacé clic para seleccionar</p>
        <p class="text-xs text-gray-500 mt-1">Se convertirán a WebP automáticamente (máx. 1600px)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          class="hidden"
        />
      </div>

      {status && <p class="text-sm text-charcoal/70">{status}</p>}

      {files.length > 0 && (
        <div class="bg-white p-4 rounded border border-gray-200">
          <h4 class="font-medium text-sm mb-2">Fotos procesadas ({files.length})</h4>
          <ul class="text-xs space-y-1 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <li key={i} class="flex justify-between">
                <span class="font-mono">{f.name}</span>
                <span class="text-gray-500">{(f.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
          <p class="text-xs text-gray-500 mt-2">Peso estimado total: {totalSize}</p>
          {missingPhotos.length > 0 && (
            <p class="text-xs text-orange-600 mt-2">⚠ {missingPhotos.length} fotos nuevas (no existen en el repo)</p>
          )}
        </div>
      )}
    </div>
  );
}
