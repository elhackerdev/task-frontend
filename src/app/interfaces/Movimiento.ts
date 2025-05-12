export interface Movimiento {
  id: number;
  idProducto: string;
  tipo: string;
  cantidad: number;
  fecha: string; // o Date
  descripcion: string;
}