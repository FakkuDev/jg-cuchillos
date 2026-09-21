import { h } from 'preact';
import { useState } from 'preact/hooks';

interface Props {
  type: 'cuchillo' | 'galeria' | 'taller' | 'material';
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function SingleEditor({ type, initialData, onSave, onCancel }: Props) {
  const [form, setForm] = useState(initialData || getDefaultForm(type));

  function getDefaultForm(type: string) {
    if (type === 'cuchillo') return { id: '', nombre: '', precio: null, estado: 'En stock', acero: '', cabo: '', terminacion: '', largo_total_cm: 0, largo_hoja_cm: 0, espesor_mm: 0, peso_g: 0, vaina: '', descripcion: '', fotos: [], destacado: false, orden: 0, activo: true };
    if (type === 'galeria') return { id: '', nombre: '', foto: '', descripcion: '', orden: 0, activo: true };
    if (type === 'taller') return { id: '', tipo: 'foto', archivo: '', url: '', titulo: '', alt: '', orden: 0, activo: true };
    return { categoria: 'Acero', nombre: '', nota: '', disponible: true };
  }

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} class="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h3 class="font-serif text-xl font-semibold text-charcoal">
        {initialData ? 'Editar' : 'Nuevo'} {type}
      </h3>

      {type === 'cuchillo' && (
        <>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ID (slug)</label>
              <input type="text" value={form.id} onChange={(e) => handleChange('id', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => handleChange('nombre', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Precio (ARS)</label>
              <input type="number" value={form.precio || ''} onChange={(e) => handleChange('precio', e.currentTarget.value ? parseFloat(e.currentTarget.value) : null)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Dejar vacío = Consultar" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.estado} onChange={(e) => handleChange('estado', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option>En stock</option>
                <option>Por encargo</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={form.orden} onChange={(e) => handleChange('orden', parseInt(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Acero</label>
              <input type="text" value={form.acero} onChange={(e) => handleChange('acero', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Cabo</label>
              <input type="text" value={form.cabo} onChange={(e) => handleChange('cabo', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Terminación</label>
              <input type="text" value={form.terminacion} onChange={(e) => handleChange('terminacion', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Largo total (cm)</label>
              <input type="number" step="0.1" value={form.largo_total_cm || ''} onChange={(e) => handleChange('largo_total_cm', parseFloat(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Largo hoja (cm)</label>
              <input type="number" step="0.1" value={form.largo_hoja_cm || ''} onChange={(e) => handleChange('largo_hoja_cm', parseFloat(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Espesor (mm)</label>
              <input type="number" step="0.1" value={form.espesor_mm || ''} onChange={(e) => handleChange('espesor_mm', parseFloat(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Peso (g)</label>
              <input type="number" value={form.peso_g || ''} onChange={(e) => handleChange('peso_g', parseFloat(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Vaina</label>
            <input type="text" value={form.vaina || ''} onChange={(e) => handleChange('vaina', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion || ''} onChange={(e) => handleChange('descripcion', e.currentTarget.value)} rows={3} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Fotos (nombres separados por ;)</label>
            <input type="text" value={Array.isArray(form.fotos) ? form.fotos.join('; ') : form.fotos} onChange={(e) => handleChange('fotos', e.currentTarget.value.split(';').map((f: string) => f.trim()).filter(Boolean))} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="foto1.webp; foto2.webp" />
          </div>

          <div class="flex gap-6">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.destacado} onChange={(e) => handleChange('destacado', e.currentTarget.checked)} class="rounded border-gray-300 text-cognac focus:ring-cognac" />
              Destacado
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.activo} onChange={(e) => handleChange('activo', e.currentTarget.checked)} class="rounded border-gray-300 text-cognac focus:ring-cognac" />
              Activo
            </label>
          </div>
        </>
      )}

      {type === 'galeria' && (
        <>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ID</label>
              <input type="text" value={form.id} onChange={(e) => handleChange('id', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => handleChange('nombre', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Foto (archivo)</label>
            <input type="text" value={form.foto} onChange={(e) => handleChange('foto', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion || ''} onChange={(e) => handleChange('descripcion', e.currentTarget.value)} rows={2} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={form.orden} onChange={(e) => handleChange('orden', parseInt(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <label class="flex items-center gap-2 text-sm pt-6">
              <input type="checkbox" checked={form.activo} onChange={(e) => handleChange('activo', e.currentTarget.checked)} class="rounded border-gray-300 text-cognac focus:ring-cognac" />
              Activo
            </label>
          </div>
        </>
      )}

      {type === 'taller' && (
        <>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ID</label>
              <input type="text" value={form.id} onChange={(e) => handleChange('id', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => handleChange('tipo', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="foto">Foto</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>
          {form.tipo === 'foto' ? (
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Archivo</label>
              <input type="text" value={form.archivo || ''} onChange={(e) => handleChange('archivo', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          ) : (
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">URL de YouTube</label>
              <input type="text" value={form.url || ''} onChange={(e) => handleChange('url', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          )}
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Título</label>
              <input type="text" value={form.titulo} onChange={(e) => handleChange('titulo', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Alt</label>
              <input type="text" value={form.alt} onChange={(e) => handleChange('alt', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Orden</label>
              <input type="number" value={form.orden} onChange={(e) => handleChange('orden', parseInt(e.currentTarget.value) || 0)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <label class="flex items-center gap-2 text-sm pt-6">
              <input type="checkbox" checked={form.activo} onChange={(e) => handleChange('activo', e.currentTarget.checked)} class="rounded border-gray-300 text-cognac focus:ring-cognac" />
              Activo
            </label>
          </div>
        </>
      )}

      {type === 'material' && (
        <>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
              <select value={form.categoria} onChange={(e) => handleChange('categoria', e.currentTarget.value)} class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option>Acero</option>
                <option>Cabo</option>
                <option>Terminación</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={(e) => handleChange('nombre', e.currentTarget.value)} required class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nota</label>
            <textarea value={form.nota || ''} onChange={(e) => handleChange('nota', e.currentTarget.value)} rows={2} class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.disponible} onChange={(e) => handleChange('disponible', e.currentTarget.checked)} class="rounded border-gray-300 text-cognac focus:ring-cognac" />
            Disponible
          </label>
        </>
      )}

      <div class="flex gap-3 pt-4 border-t border-gray-200">
        <button type="submit" class="px-4 py-2 bg-cognac text-cream rounded hover:bg-cognac/80 transition">
          Guardar
        </button>
        <button type="button" onClick={onCancel} class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
          Cancelar
        </button>
      </div>
    </form>
  );
}
