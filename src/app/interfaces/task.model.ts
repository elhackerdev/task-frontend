export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  dueDate?: string; // ISO format string, ej: "2025-06-15"
  priority: 'alta' | 'media' | 'baja';
}
