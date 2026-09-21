import cuchillosRaw from '../data/cuchillos.json';
import galeriaRaw from '../data/galeria.json';
import tallerRaw from '../data/taller.json';
import materialesRaw from '../data/materiales.json';
import { cuchilloSchema, galeriaSchema, tallerSchema, materialSchema } from './schema';

export const cuchillos = cuchilloSchema.array().parse(cuchillosRaw);
export const galeria = galeriaSchema.array().parse(galeriaRaw);
export const taller = tallerSchema.array().parse(tallerRaw);
export const materiales = materialSchema.array().parse(materialesRaw);

export const getCuchillos = () => cuchillos.filter(c => c.activo).sort((a, b) => a.orden - b.orden);
export const getGaleria = () => galeria.filter(g => g.activo).sort((a, b) => a.orden - b.orden);
export const getTaller = () => taller.filter(t => t.activo).sort((a, b) => a.orden - b.orden);
export const getMateriales = () => materiales;
