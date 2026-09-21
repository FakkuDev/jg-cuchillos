import { z } from 'zod';

export const cuchilloSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  precio: z.union([z.number(), z.null()]).optional(),
  estado: z.enum(['En stock', 'Por encargo']),
  acero: z.string(),
  cabo: z.string(),
  terminacion: z.string(),
  largo_total_cm: z.number().optional(),
  largo_hoja_cm: z.number().optional(),
  espesor_mm: z.number().optional(),
  peso_g: z.number().optional(),
  vaina: z.string().optional(),
  descripcion: z.string().optional(),
  fotos: z.array(z.string()).default([]),
  destacado: z.boolean().default(false),
  orden: z.number().default(0),
  activo: z.boolean().default(true),
});

export const galeriaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  foto: z.string().min(1),
  descripcion: z.string().optional(),
  orden: z.number().default(0),
  activo: z.boolean().default(true),
});

export const tallerSchema = z.object({
  id: z.string().min(1),
  tipo: z.enum(['foto', 'video']),
  archivo: z.string().optional(),
  url: z.string().optional(),
  titulo: z.string().min(1),
  alt: z.string().min(1),
  orden: z.number().default(0),
  activo: z.boolean().default(true),
}).refine(data => data.tipo === 'video' ? data.url : data.archivo, {
  message: 'Video requiere url, foto requiere archivo',
});

export const materialSchema = z.object({
  categoria: z.enum(['Acero', 'Cabo', 'Terminación']),
  nombre: z.string().min(1),
  nota: z.string().optional(),
  disponible: z.boolean().default(true),
});
