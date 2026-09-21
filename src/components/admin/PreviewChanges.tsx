import { h } from 'preact';
import { useState } from 'preact/hooks';
import { GitHubClient } from '../../lib/admin/github';

interface Props {
  changes: {
    new: number;
    updated: number;
    hidden: number;
    deleted: number;
    newPhotos: number;
  };
  files: { path: string; content: string | Blob }[];
  photos: { name: string; blob: Blob }[];
  token: string;
  owner: string;
  repo: string;
  branch: string;
  onPublished: () => void;
}

export default function PreviewChanges({ changes, files, photos, token, owner, repo, branch, onPublished }: Props) {
  const [status, setStatus] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!confirm('¿Publicar cambios? Esto creará un commit en GitHub.')) return;

    setIsPublishing(true);
    setStatus('Publicando...');

    try {
      const client = new GitHubClient(token, owner, repo, branch);

      const allFiles = [
        ...files.map(f => ({ path: f.path, content: typeof f.content === 'string' ? f.content : '' })),
        ...photos.map(p => ({ path: `public/cuchillos/${p.name}`, content: p.blob })),
      ];

      const result = await client.commitFiles(allFiles, 'Update from admin panel');

      if (result.success && result.commitUrl) {
        setCommitUrl(result.commitUrl);
        setStatus('✅ Publicado. Cloudflare reconstruirá el sitio en unos minutos.');
        onPublished();
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h3 class="font-serif text-xl font-semibold text-charcoal">Vista previa de cambios</h3>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-blue-50 p-3 rounded">
          <span class="block text-xs text-blue-600">Nuevos</span>
          <span class="font-bold text-lg text-blue-900">{changes.new}</span>
        </div>
        <div class="bg-yellow-50 p-3 rounded">
          <span class="block text-xs text-yellow-600">Actualizados</span>
          <span class="font-bold text-lg text-yellow-900">{changes.updated}</span>
        </div>
        <div class="bg-gray-50 p-3 rounded">
          <span class="block text-xs text-gray-600">Ocultos</span>
          <span class="font-bold text-lg text-gray-900">{changes.hidden}</span>
        </div>
        <div class="bg-red-50 p-3 rounded">
          <span class="block text-xs text-red-600">Eliminados</span>
          <span class="font-bold text-lg text-red-900">{changes.deleted}</span>
        </div>
        <div class="bg-green-50 p-3 rounded">
          <span class="block text-xs text-green-600">Fotos nuevas</span>
          <span class="font-bold text-lg text-green-900">{changes.newPhotos}</span>
        </div>
      </div>

      {status && (
        <div class={`p-3 rounded text-sm ${status.includes('✅') ? 'bg-green-50 text-green-800' : status.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {status}
        </div>
      )}

      {commitUrl && (
        <a href={commitUrl} target="_blank" rel="noopener" class="text-sm text-cognac underline">
          Ver commit en GitHub →
        </a>
      )}

      <button
        onClick={handlePublish}
        disabled={isPublishing}
        class="w-full py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPublishing ? 'Publicando...' : 'Publicar cambios'}
      </button>
    </div>
  );
}
