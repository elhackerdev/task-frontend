import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// Services
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';

// Interfaces
import { Movimiento } from '../../interfaces/Movimiento';
import { Producto } from '../../interfaces/Producto';

/**
 * Componente para gestión de movimientos de inventario
 * 
 * Features:
 * - CRUD completo de movimientos (entradas/salidas)
 * - Filtrado por tipo de movimiento y producto
 * - Integración con servicio de productos
 * - Notificaciones con PrimeNG Toast
 */
@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    TableModule,
    DialogModule,
    ToastModule,
    DropdownModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [MessageService],
})
export class MovimientoComponent implements OnInit {
  // Estado del componente
  movimientos: Movimiento[] = [];
  productos: Producto[] = [];
  cargando: boolean = false;
  
  // Control de diálogo
  mostrarDialogo: boolean = false;
  
  // Filtros
  filtroTipo: string = '';
  filtroProductoId!: number;
  
  // Selección actual
  seleccionActual: Movimiento | null = null;
  
  // Tipos de movimiento para dropdown
  tiposMovimiento = [
    { label: 'Entrada', value: 'ENTRADA' },
    { label: 'Salida', value: 'SALIDA' },
  ];

  // Formulario
  movimientoForm: FormGroup;

  constructor(
    private movimientoService: MovimientoService,
    private productoService: ProductoService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.movimientoForm = this.fb.group({
      id: [],
      idProducto: [null, Validators.required],
      tipo: ['ENTRADA', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarProductos();
  }

  // --------------------------
  // Carga de datos inicial
  // --------------------------

  private cargarMovimientos(): void {
    this.cargando = true;
    this.movimientoService.buscarMovimientos().subscribe({
      next: (data) => (this.movimientos = data),
      error: () => this.mostrarError('Error al cargar movimientos'),
      complete: () => (this.cargando = false),
    });
  }

  private cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => (this.productos = data),
      error: () => this.mostrarError('Error al cargar productos')
    });
  }

  // --------------------------
  // Gestión de movimientos
  // --------------------------

  abrirDialogoNuevo(): void {
    this.resetFormulario();
    this.mostrarDialogo = true;
  }

  editarMovimiento(mov: Movimiento): void {
    this.movimientoForm.patchValue({
      id: mov.id,
      idProducto: mov.idProducto,
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      descripcion: mov.descripcion,
    });
    this.seleccionActual = mov;
    this.mostrarDialogo = true;
  }

  guardarMovimiento(): void {
    if (this.movimientoForm.invalid) return;

    const movimiento: Movimiento = {
      ...this.movimientoForm.value,
      producto: this.productos.find(p => p.id === this.movimientoForm.value.idProducto)!
    };

    const operacion = this.seleccionActual 
      ? this.movimientoService.actualizarMovimiento(this.seleccionActual.id, movimiento)
      : this.movimientoService.crearMovimiento(movimiento);

    operacion.subscribe({
      next: () => {
        this.cargarMovimientos();
        this.mostrarExito(this.seleccionActual 
          ? 'Movimiento actualizado correctamente' 
          : 'Movimiento creado correctamente');
      },
      error: () => this.mostrarError(this.seleccionActual 
        ? 'Error al actualizar movimiento' 
        : 'Error al crear movimiento'),
      complete: () => this.cerrarDialogo()
    });
  }

  confirmarEliminarMovimiento(id: number): void {
    if (!confirm('¿Deseas eliminar este movimiento?')) return;
    
    this.movimientoService.eliminarMovimiento(id).subscribe({
      next: () => {
        this.cargarMovimientos();
        this.mostrarExito('Movimiento eliminado correctamente');
      },
      error: () => this.mostrarError('Error al eliminar movimiento'),
    });
  }

  // --------------------------
  // Filtrado
  // --------------------------

  filtrarPorTipo(): void {
    this.buscarPorFiltro(this.filtroProductoId, this.filtroTipo || undefined);
  }

  public buscarPorFiltro(productoId?: number, tipo?: string): void {
    this.cargando = true;
    this.movimientoService.buscarMovimientos(productoId, tipo).subscribe({
      next: (data) => (this.movimientos = data),
      error: () => this.mostrarError('Error al buscar movimientos'),
      complete: () => (this.cargando = false),
    });
  }

  // --------------------------
  // Helpers
  // --------------------------

  public cerrarDialogo(): void {
    this.resetFormulario();
    this.mostrarDialogo = false;
  }

  private resetFormulario(): void {
    this.movimientoForm.reset({
      idProducto: null,
      tipo: 'ENTRADA',
      cantidad: 0,
      descripcion: '',
    });
    this.seleccionActual = null;
  }

  private mostrarExito(detalle: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: detalle,
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detalle,
    });
  }

  // Método placeholder (eliminar si no se usa)
  abrirDialogo() {
    console.warn('Método abrirDialogo() no implementado');
  }
}