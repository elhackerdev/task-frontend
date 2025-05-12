export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  codigo: string;
  fechaCreacion: string; // o Date si haces parsing
  factorDeRotacion: number;
}