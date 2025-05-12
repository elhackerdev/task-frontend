import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../../interfaces/Producto';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/api/productos'; // Cambia si tu endpoint base es diferente

  constructor(private http: HttpClient) {}

  // POST /productos
  crearProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }

  // GET /productos/{id}
  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  // GET /productos?nombre=&categoria=&codigo=
  obtenerProductos(nombre?: string, categoria?: string, codigo?: string): Observable<Producto[]> {
    let params = new HttpParams();
    if (nombre) params = params.set('nombre', nombre);
    if (categoria) params = params.set('categoria', categoria);
    if (codigo) params = params.set('codigo', codigo);

    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  // PUT /productos/{id}
  actualizarProducto(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
  }

  // DELETE /productos/{id}
  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

