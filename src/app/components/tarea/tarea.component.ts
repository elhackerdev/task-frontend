import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TaskService } from '../../core/services/task.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-tarea',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,    
    DialogModule,
    TableModule,
    ToastModule,
    ButtonModule,
    SelectModule
  ],
  templateUrl: './tarea.component.html',
  providers: [MessageService],
})
export class TareaComponent implements OnInit {
  tareas: any[] = [];
  tareaSeleccionada: any = null;
  tareaForm: FormGroup;
  dialogVisible = false;
  loading = false;

  filtroEstado: string = '';
  filtroPrioridad: string = '';

  estados = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en progreso' },
    { label: 'Completado', value: 'completado' },
  ];

  prioridades = [
    { label: 'Baja', value: 'baja' },
    { label: 'Media', value: 'media' },
    { label: 'Alta', value: 'alta' },
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private messageService: MessageService
  ) {
    this.tareaForm = this.fb.group({
      id: [],
      title: ['', Validators.required],
      description: [''],
      status: ['pendiente', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['media', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarTareas();
  }
limpiarFiltros(){
  this.filtroEstado = '';
  this.filtroPrioridad = '';
  this.cargarTareas();
}
  cargarTareas(): void {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tareas = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar tareas',
        });
        this.loading = false;
      },
    });
  }

  buscarTareas(): void {
    this.loading = true;
    this.taskService.getAllTasks(this.filtroEstado,this.filtroPrioridad).subscribe({
      next: (data) => {
        this.tareas = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar tareas',
        });
        this.loading = false;
      },
    });
  }

  abrirDialogoNuevo(): void {
    this.tareaSeleccionada = null;
    this.tareaForm.reset();
    this.dialogVisible = true;
  }

  editar(tarea: any): void {
    this.tareaSeleccionada = tarea;
    this.tareaForm.patchValue(tarea);
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.tareaForm.invalid) return;

    const tarea = this.tareaForm.value;
    if (tarea.id) {
      // actualizar
      this.taskService.updateTask(tarea.id, tarea).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarea actualizada correctamente',
          });
          this.dialogVisible = false;
          this.cargarTareas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la tarea',
          });
        },
      });
    } else {
      // crear
      this.taskService.createTask(tarea).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarea creada correctamente',
          });
          this.dialogVisible = false;
          this.cargarTareas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la tarea',
          });
        },
      });
    }
  }

  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'Tarea eliminada correctamente',
        });
        this.cargarTareas();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar la tarea',
        });
      },
    });
  }
}
