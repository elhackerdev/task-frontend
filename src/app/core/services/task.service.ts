import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../interfaces/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = 'http://localhost:5947/api/tasks'; // Asegúrate de usar la URL correcta

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // El token se guarda tras el login
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAllTasks(estado?: string, prioridad?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (prioridad) params = params.set('prioridad', prioridad);
    return this.http.get<Task[]>(this.baseUrl, {
      headers: this.getHeaders(),
      params: params,
    });
  }
  
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task, {
      headers: this.getHeaders(),
    });
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task, {
      headers: this.getHeaders(),
    });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
