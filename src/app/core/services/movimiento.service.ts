import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movimiento } from '../../interfaces/Movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private apiUrl = 'http://localhost:8080/api/movimientos'; // Ajusta el puerto/baseURL si es necesario

  constructor(private http: HttpClient) {}

  // POST /movimientos
  crearMovimiento(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  // GET /movimientos/{id}
  obtenerMovimientoPorId(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  // GET /movimientos?productoId=...&tipo=...
  buscarMovimientos(productoId?: number, tipo?: string): Observable<Movimiento[]> {
    let params = new HttpParams();
    if (productoId !== undefined) params = params.set('productoId', productoId.toString());
    if (tipo) params = params.set('tipo', tipo);

    return this.http.get<Movimiento[]>(this.apiUrl, { params });
  }

  // PUT /movimientos/{id}
  actualizarMovimiento(id: number, movimiento: Movimiento): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  // DELETE /movimientos/{id}
  eliminarMovimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
