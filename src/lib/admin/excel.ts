import { z, ZodError } from 'zod';
import { cuchilloSchema, galeriaSchema, tallerSchema, materialSchema } from '../schema';

type SheetName = 'Cuchillos' | 'Galeria' | 'Taller' | 'Materiales';

interface ValidationError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}

function parsePrice(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  let str = String(val).trim().replace(/[$]/g, '');
  if (str.toLowerCase() === 'consultar') return null;

  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    if (/,\d{2}$/.test(str)) str = str.replace(',', '.');
    else str = str.replace(/,/g, '');
  } else if (str.includes('.')) {
    if (/\.\d{3}$/.test(str)) str = str.replace(/\./g, '');
  }
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parseBool(val: any): boolean {
  if (typeof val === 'boolean') return val;
  if (val === undefined || val === null) return false;
  const str = String(val).toLowerCase().trim();
  return ['si', 'sí', 'yes', 'true', '1', 'x'].includes(str);
}

function normalizeRow(row: any, sheet: SheetName) {
  const clean: any = {};
  for (const key in row) {
    const val = row[key];
    if (val === undefined || val === null) continue;
    if (typeof val === 'string') clean[key] = val.trim();
    else clean[key] = val;
  }

  if (sheet === 'Cuchillos') {
    clean.precio = parsePrice(clean.precio);
    clean.destacado = parseBool(clean.destacado);
    clean.activo = parseBool(clean.activo);
    if (clean.fotos && typeof clean.fotos === 'string') {
      clean.fotos = clean.fotos.split(';').map((f: string) => f.trim()).filter(Boolean);
    }
    ['largo_total_cm', 'largo_hoja_cm', 'espesor_mm', 'peso_g', 'orden'].forEach(k => {
      if (clean[k] !== undefined) clean[k] = parseFloat(String(clean[k]).replace(',', '.')) || 0;
    });
  } else if (sheet === 'Galeria' || sheet === 'Taller') {
    clean.activo = parseBool(clean.activo);
    if (clean.orden !== undefined) clean.orden = parseInt(String(clean.orden)) || 0;
  } else if (sheet === 'Materiales') {
    clean.disponible = parseBool(clean.disponible);
  }
  return clean;
}

export async function downloadTemplate() {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const addSheet = (name: string, headers: string[], examples: any[][]) => {
    const ws = workbook.addWorksheet(name);
    ws.columns = headers.map(h => ({ header: h, key: h, width: 20 }));
    ws.getRow(1).font = { bold: true };
    examples.forEach(ex => ws.addRow(ex));
  };

  addSheet('Cuchillos',
    ['id', 'nombre', 'precio', 'estado', 'acero', 'cabo', 'terminacion', 'largo_total_cm', 'largo_hoja_cm', 'espesor_mm', 'peso_g', 'vaina', 'descripcion', 'fotos', 'destacado', 'orden', 'activo'],
    [['facon-1', 'FACÓN N690', 690000, 'En stock', 'N690', 'Guayubira', 'Satín', 32, 18, 4, 280, 'Cuero', 'Desc...', 'foto1.webp;foto2.webp', 'si', 1, 'si']]
  );
  addSheet('Galeria',
    ['id', 'nombre', 'foto', 'descripcion', 'orden', 'activo'],
    [['gal-1', 'Juego asado', 'gal1.webp', 'Desc...', 1, 'si']]
  );
  addSheet('Taller',
    ['id', 'tipo', 'archivo', 'url', 'titulo', 'alt', 'orden', 'activo'],
    [['tal-1', 'foto', 'tal1.webp', '', 'Forja', 'Alt...', 1, 'si']]
  );
  addSheet('Materiales',
    ['categoria', 'nombre', 'nota', 'disponible'],
    [['Acero', 'N690', 'Nota...', 'si']]
  );

  const leeme = workbook.addWorksheet('Leeme');
  leeme.addRow(['INSTRUCCIONES']);
  leeme.addRow(['1. No modifiques los nombres de las columnas ni las hojas.']);
  leeme.addRow(['2. El "id" debe ser único (sin espacios, usar guiones). Si está vacío, se genera del nombre.']);
  leeme.addRow(['3. Precios: usá números (690000) o formato ARS ($690.000). Dejá vacío o "Consultar" si no tiene precio.']);
  leeme.addRow(['4. Fotos: separá los nombres de archivo con punto y coma (;).']);
  leeme.addRow(['5. Sí/No: usá "si", "no", "x" o dejá vacío (se toma como no).']);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jg-cuchillos-plantilla.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportData(data: { cuchillos: any[], galeria: any[], taller: any[], materiales: any[] }) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const addData = (name: string, items: any[]) => {
    if (!items.length) return;
    const ws = workbook.addWorksheet(name);
    const headers = Object.keys(items[0]);
    ws.columns = headers.map(h => ({ header: h, key: h, width: 20 }));
    ws.getRow(1).font = { bold: true };
    items.forEach(item => ws.addRow(item));
  };

  addData('Cuchillos', data.cuchillos);
  addData('Galeria', data.galeria);
  addData('Taller', data.taller);
  addData('Materiales', data.materiales);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jg-cuchillos-export-${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function processImport(file: File): Promise<{ data: any; errors: ValidationError[] }> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const allData: any = { cuchillos: [], galeria: [], taller: [], materiales: [] };
  const allErrors: ValidationError[] = [];

  const processSheet = (sheetName: SheetName, schema: z.ZodSchema, targetKey: keyof typeof allData) => {
    const ws = workbook.getWorksheet(sheetName);
    if (!ws) return;

    const headers = ws.getRow(1).values as string[];
    const rows = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) obj[header] = cell.value;
      });
      if (Object.keys(obj).length > 0) rows.push({ raw: obj, rowNum: rowNumber });
    });

    rows.forEach(({ raw, rowNum }) => {
      const normalized = normalizeRow(raw, sheetName);
      if (!normalized.id && normalized.nombre) {
        normalized.id = normalized.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      const result = schema.safeParse(normalized);
      if (result.success) {
        (allData[targetKey] as any[]).push(result.data);
      } else {
        (result.error as ZodError).errors.forEach(e => {
          allErrors.push({
            sheet: sheetName,
            row: rowNum,
            field: e.path.join('.'),
            message: e.message
          });
        });
      }
    });
  };

  processSheet('Cuchillos', cuchilloSchema, 'cuchillos');
  processSheet('Galeria', galeriaSchema, 'galeria');
  processSheet('Taller', tallerSchema, 'taller');
  processSheet('Materiales', materialSchema, 'materiales');

  return { data: allData, errors: allErrors };
}
