import { h } from 'preact';
import { useState } from 'preact/hooks';
import { downloadTemplate, exportData, processImport } from '../../lib/admin/excel';

interface Props {
  currentData: {
    cuchillos: any[];
    galeria: any[];
    taller: any[];
    materiales: any[];
  };
  onValidData: (data: any) => void;
}

export default function ExcelManager({ currentData, onValidData }: Props) {
  const [errors, setErrors] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState<any>(null);

  const handleImport = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setStatus('Procesando...');
    setErrors([]);
    setPreview(null);

    try {
      const { data, errors: importErrors } = await processImport(file);
      if (importErrors.length > 0) {
        setErrors(importErrors);
        setStatus(`Importación fallida: ${importErrors.length} errores.`);
      } else {
        setPreview(data);
        setStatus('Datos válidos. Revisá la vista previa y publicá.');
      }
    } catch (err) {
      setStatus('Error al leer el archivo.');
    }
    input.value = '';
  };

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 class="text-xl font-serif font-semibold text-charcoal mb-4">Gestión por Excel</h2>
        <div class="flex flex-wrap gap-3">
          <button onClick={() => downloadTemplate()} class="px-4 py-2 bg-charcoal text-cream rounded hover:bg-charcoal/80 transition">
            Descargar plantilla
          </button>
          <button onClick={() => exportData(currentData)} class="px-4 py-2 border border-charcoal text-charcoal rounded hover:bg-gray-50 transition">
            Exportar datos actuales
          </button>
          <label class="px-4 py-2 bg-cognac text-cream rounded hover:bg-cognac/80 transition cursor-pointer">
            Importar Excel
            <input type="file" accept=".xlsx, .xls" onChange={handleImport} class="hidden" />
          </label>
        </div>
      </div>

      {status && (
        <div class={`p-4 rounded border ${errors.length ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          {status}
        </div>
      )}

      {errors.length > 0 && (
        <div class="bg-white p-6 rounded-lg border border-red-200">
          <h3 class="font-bold text-red-800 mb-3">Errores de validación</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead class="bg-red-50 text-red-900">
                <tr>
                  <th class="p-2">Hoja</th>
                  <th class="p-2">Fila</th>
                  <th class="p-2">Campo</th>
                  <th class="p-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, i) => (
                  <tr key={i} class="border-b border-red-100">
                    <td class="p-2">{err.sheet}</td>
                    <td class="p-2">{err.row}</td>
                    <td class="p-2 font-mono">{err.field}</td>
                    <td class="p-2">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview && (
        <div class="bg-white p-6 rounded-lg border border-green-200">
          <h3 class="font-bold text-green-800 mb-3">Vista previa de cambios</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div class="bg-gray-50 p-3 rounded">
              <span class="block text-gray-500">Cuchillos</span>
              <span class="font-bold text-lg">{preview.cuchillos.length}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <span class="block text-gray-500">Galería</span>
              <span class="font-bold text-lg">{preview.galeria.length}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <span class="block text-gray-500">Taller</span>
              <span class="font-bold text-lg">{preview.taller.length}</span>
            </div>
            <div class="bg-gray-50 p-3 rounded">
              <span class="block text-gray-500">Materiales</span>
              <span class="font-bold text-lg">{preview.materiales.length}</span>
            </div>
          </div>
          <button
            onClick={() => { onValidData(preview); setStatus('Datos cargados en memoria. Listo para publicar.'); setPreview(null); }}
            class="w-full py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
          >
            Confirmar y cargar datos
          </button>
        </div>
      )}
    </div>
  );
}
