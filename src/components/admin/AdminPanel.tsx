import { h } from 'preact';
import { useState } from 'preact/hooks';
import ExcelManager from './ExcelManager';
import PhotoManager from './PhotoManager';
import SingleEditor from './SingleEditor';
import PreviewChanges from './PreviewChanges';

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
  const [photos, setPhotos] = useState<{ name: string; blob: Blob }[]>([]);
  const [pendingChanges, setPendingChanges] = useState<any>(null);

  const token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token_remember') || '';
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER || 'tu-usuario';
  const repo = import.meta.env.PUBLIC_GITHUB_REPO || 'jg-cuchillos';
  const branch = import.meta.env.PUBLIC_GITHUB_BRANCH || 'main';

  const handleValidData = (newData: any) => {
    const changes = {
      new: newData.cuchillos.filter((c: any) => !data.cuchillos.find((dc: any) => dc.id === c.id)).length,
      updated: newData.cuchillos.filter((c: any) => data.cuchillos.find((dc: any) => dc.id === c.id)).length,
      hidden: newData.cuchillos.filter((c: any) => !c.activo).length,
      deleted: 0,
      newPhotos: photos.length,
    };

    const files = [
      { path: 'src/data/cuchillos.json', content: JSON.stringify(newData.cuchillos, null, 2) },
      { path: 'src/data/galeria.json', content: JSON.stringify(newData.galeria, null, 2) },
      { path: 'src/data/taller.json', content: JSON.stringify(newData.taller, null, 2) },
      { path: 'src/data/materiales.json', content: JSON.stringify(newData.materiales, null, 2) },
    ];

    setPendingChanges({ changes, files });
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
  };

  const handleDeleteItem = (id: string, type: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    const updated = data[type].filter((i: any) => i.id !== id);
    setData({ ...data, [type]: updated });
  };

  const handlePhotosReady = (files: { name: string; blob: Blob }[]) => {
    setPhotos(files);
  };

  const handlePublished = () => {
    setPendingChanges(null);
    setPhotos([]);
    alert('✅ Publicado. El sitio se reconstruirá en Cloudflare en unos minutos.');
  };

  return (
    <div class="container">
      <h1>⚙️ Panel de Administración</h1>

      <div class="config-form" style="margin-bottom: 20px;">
        <input type="text" value={owner} readOnly placeholder="Owner" />
        <input type="text" value={repo} readOnly placeholder="Repo" />
        <input type="text" value={branch} readOnly placeholder="Branch" />
      </div>

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
          <div style="margin-top: 30px;">
            <h3 style="font-size: 18px; margin-bottom: 15px;">Gestión de Fotos</h3>
            <PhotoManager onFilesReady={handlePhotosReady} existingFiles={[]} />
          </div>
          {pendingChanges && (
            <div style="margin-top: 30px;">
              <PreviewChanges
                changes={pendingChanges.changes}
                files={pendingChanges.files}
                photos={photos}
                token={token}
                owner={owner}
                repo={repo}
                branch={branch}
                onPublished={handlePublished}
              />
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
