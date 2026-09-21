import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import ExcelManager from './ExcelManager';
import PhotoManager from './PhotoManager';
import SingleEditor from './SingleEditor';
import { GitHubClient } from '../../lib/admin/github';

interface Props {
  currentData: {
    cuchillos: any[];
    galeria: any[];
    taller: any[];
    materiales: any[];
  };
}

export default function AdminPanel({ currentData }: Props) {
  const [activeTab, setActiveTab] = useState<'excel' | 'cuchillos' | 'galeria' | 'taller' | 'materiales'>('excel');
  const [data, setData] = useState(currentData);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<any>(null);

  // Fotos separadas por sección
  const [photosCuchillos, setPhotosCuchillos] = useState<{ name: string; blob: Blob }[]>([]);
  const [photosGaleria, setPhotosGaleria] = useState<{ name: string; blob: Blob }[]>([]);
  const [photosTaller, setPhotosTaller] = useState<{ name: string; blob: Blob }[]>([]);

  const [pendingChanges, setPendingChanges] = useState<any>(null);
  const [status, setStatus] = useState('');

  const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token_remember') || '';
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER || 'FakkuDev';
  const repo = import.meta.env.PUBLIC_GITHUB_REPO || 'jg-cuchillos';
  const branch = import.meta.env.PUBLIC_GITHUB_BRANCH || 'main';

  // Calcular cambios pendientes
  useEffect(() => {
    const changes = {
      new: 0,
      updated: 0,
      hidden: 0,
      deleted: 0,
      newPhotos: photosCuchillos.length + photosGaleria.length + photosTaller.length,
    };

    const hasChanges = JSON.stringify(data) !== JSON.stringify(currentData) ||
                       photosCuchillos.length > 0 ||
                       photosGaleria.length > 0 ||
                       photosTaller.length > 0;

    if (hasChanges) {
      // Cuchillos
      data.cuchillos.forEach((c: any) => {
        const original = currentData.cuchillos.find((dc: any) => dc.id === c.id);
        if (!original) changes.new++;
        else if (!c.activo && original.activo) changes.hidden++;
        else changes.updated++;
      });
      currentData.cuchillos.forEach((dc: any) => {
        if (!data.cuchillos.find((c: any) => c.id === dc.id)) changes.deleted++;
      });

      // Galería
      data.galeria.forEach((g: any) => {
        const original = currentData.galeria.find((dg: any) => dg.id === g.id);
        if (!original) changes.new++;
        else if (!g.activo && original.activo) changes.hidden++;
        else changes.updated++;
      });
      currentData.galeria.forEach((dg: any) => {
        if (!data.galeria.find((g: any) => g.id === dg.id)) changes.deleted++;
      });

      // Taller
      data.taller.forEach((t: any) => {
        const original = currentData.taller.find((dt: any) => dt.id === t.id);
        if (!original) changes.new++;
        else if (!t.activo && original.activo) changes.hidden++;
        else changes.updated++;
      });
      currentData.taller.forEach((dt: any) => {
        if (!data.taller.find((t: any) => t.id === dt.id)) changes.deleted++;
      });

      // Materiales
      data.materiales.forEach((m: any) => {
        const original = currentData.materiales.find((dm: any) => dm.nombre === m.nombre && dm.categoria === m.categoria);
        if (!original) changes.new++;
        else if (!m.disponible && original.disponible) changes.hidden++;
        else changes.updated++;
      });
      currentData.materiales.forEach((dm: any) => {
        if (!data.materiales.find((m: any) => m.nombre === dm.nombre && m.categoria === dm.categoria)) changes.deleted++;
      });

      const files = [
        { path: 'src/data/cuchillos.json', content: JSON.stringify(data.cuchillos, null, 2) },
        { path: 'src/data/galeria.json', content: JSON.stringify(data.galeria, null, 2) },
        { path: 'src/data/taller.json', content: JSON.stringify(data.taller, null, 2) },
        { path: 'src/data/materiales.json', content: JSON.stringify(data.materiales, null, 2) },
      ];

      setPendingChanges({ changes, files });
    } else {
      setPendingChanges(null);
    }
  }, [data, photosCuchillos, photosGaleria, photosTaller]);

  const handleValidData = (newData: any) => {
    setData(newData);
    setStatus('Datos cargados. Revisá la vista previa y publicá.');
  };

  const handleSaveItem = (item: any) => {
    const type = editingType;
    const updated = [...data[type]];
    const index = updated.findIndex((i: any) => i.id === item.id);

    if (index >= 0) {
      updated[index] = item;
    } else {
      updated.push(item);
    }

    setData({ ...data, [type]: updated });
    setEditingItem(null);
    setEditingType(null);
    setStatus(`✅ ${type.slice(0, -1)} guardado. Andá a la pestaña Excel para publicar.`);
  };

  const handleDeleteItem = (id: string, type: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    const updated = data[type].filter((i: any) => i.id !== id);
    setData({ ...data, [type]: updated });
    setStatus(`🗑️ Item eliminado. Andá a la pestaña Excel para publicar.`);
  };

  const handlePublish = async () => {
    if (!pendingChanges) return;
    if (!confirm('¿Publicar cambios? Esto creará un commit en GitHub.')) return;

    setStatus('Publicando...');

    try {
      const client = new GitHubClient(token, owner, repo, branch);

      const allFiles = [
        ...pendingChanges.files.map((f: any) => ({
          path: f.path,
          content: typeof f.content === 'string' ? f.content : ''
        })),
        ...photosCuchillos.map(p => ({
          path: `public/cuchillos/${p.name}`,
          content: p.blob
        })),
        ...photosGaleria.map(p => ({
          path: `public/galeria/${p.name}`,
          content: p.blob
        })),
        ...photosTaller.map(p => ({
          path: `public/taller/${p.name}`,
          content: p.blob
        })),
      ];

      const result = await client.commitFiles(allFiles, 'Update from admin panel');

      if (result.success && result.commitUrl) {
        setStatus(`✅ Publicado con éxito. Cloudflare reconstruirá el sitio en 1-2 minutos.`);
        setPendingChanges(null);
        setPhotosCuchillos([]);
        setPhotosGaleria([]);
        setPhotosTaller([]);
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div class="container">
      <h1>⚙️ Panel de Administración</h1>

      <div class="config-form" style="margin-bottom: 20px;">
        <input type="text" value={owner} readOnly placeholder="Owner" />
        <input type="text" value={repo} readOnly placeholder="Repo" />
        <input type="text" value={branch} readOnly placeholder="Branch" />
      </div>

      {status && (
        <div class={`p-3 rounded mb-4 text-sm ${
          status.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
          status.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {status}
        </div>
      )}

      <div class="tabs">
        <button class={`tab ${activeTab === 'excel' ? 'active' : ''}`} onClick={() => setActiveTab('excel')}>Excel</button>
        <button class={`tab ${activeTab === 'cuchillos' ? 'active' : ''}`} onClick={() => setActiveTab('cuchillos')}>Cuchillos ({data.cuchillos.length})</button>
        <button class={`tab ${activeTab === 'galeria' ? 'active' : ''}`} onClick={() => setActiveTab('galeria')}>Galería ({data.galeria.length})</button>
        <button class={`tab ${activeTab === 'taller' ? 'active' : ''}`} onClick={() => setActiveTab('taller')}>Taller ({data.taller.length})</button>
        <button class={`tab ${activeTab === 'materiales' ? 'active' : ''}`} onClick={() => setActiveTab('materiales')}>Materiales ({data.materiales.length})</button>
      </div>

      {activeTab === 'excel' && (
        <div class="panel active">
          <ExcelManager currentData={data} onValidData={handleValidData} />

          {pendingChanges && (
            <div style="margin-top: 30px;">
              <div class="bg-white p-6 rounded-lg border border-green-200 space-y-4">
                <h3 class="font-serif text-xl font-semibold text-charcoal">Vista previa de cambios</h3>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div class="bg-blue-50 p-3 rounded">
                    <span class="block text-xs text-blue-600">Nuevos</span>
                    <span class="font-bold text-lg text-blue-900">{pendingChanges.changes.new}</span>
                  </div>
                  <div class="bg-yellow-50 p-3 rounded">
                    <span class="block text-xs text-yellow-600">Actualizados</span>
                    <span class="font-bold text-lg text-yellow-900">{pendingChanges.changes.updated}</span>
                  </div>
                  <div class="bg-gray-50 p-3 rounded">
                    <span class="block text-xs text-gray-600">Ocultos</span>
                    <span class="font-bold text-lg text-gray-900">{pendingChanges.changes.hidden}</span>
                  </div>
                  <div class="bg-red-50 p-3 rounded">
                    <span class="block text-xs text-red-600">Eliminados</span>
                    <span class="font-bold text-lg text-red-900">{pendingChanges.changes.deleted}</span>
                  </div>
                  <div class="bg-green-50 p-3 rounded">
                    <span class="block text-xs text-green-600">Fotos nuevas</span>
                    <span class="font-bold text-lg text-green-900">{pendingChanges.changes.newPhotos}</span>
                  </div>
                </div>

                <button
                  onClick={handlePublish}
                  class="w-full py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                >
                  Publicar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cuchillos' && (
        <div class="panel active">
          {editingItem ? (
            <SingleEditor
              type="cuchillo"
              initialData={editingItem}
              onSave={handleSaveItem}
              onCancel={() => { setEditingItem(null); setEditingType(null); }}
            />
          ) : (
            <>
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 18px; margin-bottom: 15px;">Gestión de Fotos - Cuchillos</h3>
                <PhotoManager
                  onFilesReady={setPhotosCuchillos}
                  existingFiles={data.cuchillos.flatMap((c: any) => c.fotos || [])}
                  folder="cuchillos"
                />
              </div>

              <button onClick={() => { setEditingItem({}); setEditingType('cuchillos'); }} class="px-4 py-2 bg-cognac text-cream rounded mb-4">
                + Nuevo cuchillo
              </button>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                  <thead style="background: #f5f5f5;">
                    <tr>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">ID</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Nombre</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Precio</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Estado</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Activo</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.cuchillos.map((c: any) => (
                      <tr key={c.id} style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; font-size: 13px; font-family: monospace;">{c.id}</td>
                        <td style="padding: 12px; font-size: 13px;">{c.nombre}</td>
                        <td style="padding: 12px; font-size: 13px;">{c.precio ? `$${c.precio.toLocaleString('es-AR')}` : 'Consultar'}</td>
                        <td style="padding: 12px; font-size: 13px;">{c.estado}</td>
                        <td style="padding: 12px; font-size: 13px;">{c.activo ? '✅' : ''}</td>
                        <td style="padding: 12px; font-size: 13px;">
                          <button onClick={() => { setEditingItem(c); setEditingType('cuchillos'); }} style="margin-right: 8px; color: #8B4513; background: none; border: none; cursor: pointer;">Editar</button>
                          <button onClick={() => handleDeleteItem(c.id, 'cuchillos')} style="color: #dc2626; background: none; border: none; cursor: pointer;">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'galeria' && (
        <div class="panel active">
          {editingItem ? (
            <SingleEditor
              type="galeria"
              initialData={editingItem}
              onSave={handleSaveItem}
              onCancel={() => { setEditingItem(null); setEditingType(null); }}
            />
          ) : (
            <>
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 18px; margin-bottom: 15px;">Gestión de Fotos - Galería</h3>
                <PhotoManager
                  onFilesReady={setPhotosGaleria}
                  existingFiles={data.galeria.map((g: any) => g.foto).filter(Boolean)}
                  folder="galeria"
                />
              </div>

              <button onClick={() => { setEditingItem({}); setEditingType('galeria'); }} class="px-4 py-2 bg-cognac text-cream rounded mb-4">
                + Nuevo item
              </button>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                  <thead style="background: #f5f5f5;">
                    <tr>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">ID</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Nombre</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Foto</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Activo</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.galeria.map((g: any) => (
                      <tr key={g.id} style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; font-size: 13px; font-family: monospace;">{g.id}</td>
                        <td style="padding: 12px; font-size: 13px;">{g.nombre}</td>
                        <td style="padding: 12px; font-size: 13px; font-family: monospace;">{g.foto}</td>
                        <td style="padding: 12px; font-size: 13px;">{g.activo ? '✅' : ''}</td>
                        <td style="padding: 12px; font-size: 13px;">
                          <button onClick={() => { setEditingItem(g); setEditingType('galeria'); }} style="margin-right: 8px; color: #8B4513; background: none; border: none; cursor: pointer;">Editar</button>
                          <button onClick={() => handleDeleteItem(g.id, 'galeria')} style="color: #dc2626; background: none; border: none; cursor: pointer;">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'taller' && (
        <div class="panel active">
          {editingItem ? (
            <SingleEditor
              type="taller"
              initialData={editingItem}
              onSave={handleSaveItem}
              onCancel={() => { setEditingItem(null); setEditingType(null); }}
            />
          ) : (
            <>
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 18px; margin-bottom: 15px;">Gestión de Fotos - Taller</h3>
                <PhotoManager
                  onFilesReady={setPhotosTaller}
                  existingFiles={data.taller.filter((t: any) => t.tipo === 'foto').map((t: any) => t.archivo).filter(Boolean)}
                  folder="taller"
                />
              </div>

              <button onClick={() => { setEditingItem({}); setEditingType('taller'); }} class="px-4 py-2 bg-cognac text-cream rounded mb-4">
                + Nuevo item
              </button>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                  <thead style="background: #f5f5f5;">
                    <tr>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">ID</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Tipo</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Título</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Activo</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.taller.map((t: any) => (
                      <tr key={t.id} style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; font-size: 13px; font-family: monospace;">{t.id}</td>
                        <td style="padding: 12px; font-size: 13px;">{t.tipo}</td>
                        <td style="padding: 12px; font-size: 13px;">{t.titulo}</td>
                        <td style="padding: 12px; font-size: 13px;">{t.activo ? '✅' : '❌'}</td>
                        <td style="padding: 12px; font-size: 13px;">
                          <button onClick={() => { setEditingItem(t); setEditingType('taller'); }} style="margin-right: 8px; color: #8B4513; background: none; border: none; cursor: pointer;">Editar</button>
                          <button onClick={() => handleDeleteItem(t.id, 'taller')} style="color: #dc2626; background: none; border: none; cursor: pointer;">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'materiales' && (
        <div class="panel active">
          {editingItem ? (
            <SingleEditor
              type="material"
              initialData={editingItem}
              onSave={handleSaveItem}
              onCancel={() => { setEditingItem(null); setEditingType(null); }}
            />
          ) : (
            <>
              <button onClick={() => { setEditingItem({}); setEditingType('materiales'); }} class="px-4 py-2 bg-cognac text-cream rounded mb-4">
                + Nuevo material
              </button>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                  <thead style="background: #f5f5f5;">
                    <tr>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Categoría</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Nombre</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Nota</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Disponible</th>
                      <th style="padding: 12px; text-align: left; font-size: 13px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.materiales.map((m: any) => (
                      <tr key={m.nombre} style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; font-size: 13px;">{m.categoria}</td>
                        <td style="padding: 12px; font-size: 13px;">{m.nombre}</td>
                        <td style="padding: 12px; font-size: 13px;">{m.nota}</td>
                        <td style="padding: 12px; font-size: 13px;">{m.disponible ? '✅' : '❌'}</td>
                        <td style="padding: 12px; font-size: 13px;">
                          <button onClick={() => { setEditingItem(m); setEditingType('materiales'); }} style="margin-right: 8px; color: #8B4513; background: none; border: none; cursor: pointer;">Editar</button>
                          <button onClick={() => handleDeleteItem(m.nombre, 'materiales')} style="color: #dc2626; background: none; border: none; cursor: pointer;">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
