import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Movimiento } from '../../interfaces/Movimiento';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../interfaces/Producto';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';

@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.component.html',
  styleUrl: './movimiento.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
abrirDialogo() {
throw new Error('Method not implemented.');
}
  movimientos: Movimiento[] = [];
  productos: Producto[] = [];
  movimientoForm: FormGroup;
  seleccionActual: Movimiento | null = null;
  mensajeError: string | null = null;
  mostrarDialogo: boolean = false;
  cargando: boolean = false;
  filtroTipo: string = '';
  filtroProductoId! :number ;
  tiposMovimiento = [
    { label: 'Entrada', value: 'ENTRADA' },
    { label: 'Salida', value: 'SALIDA' },
  ];

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
    
  }

  cargarMovimientos(): void {
    this.cargando = true;
    this.movimientoService.buscarMovimientos().subscribe({
      next: (data) => (this.movimientos = data),
      error: () => this.mostrarError('Error al cargar movimientos'),
      complete: () => (this.cargando = false),
    });
  }

 

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
      producto: this.productos.find(
        (p) => p.id === this.movimientoForm.value.productoId
      )!,
    };

    if (this.seleccionActual) {
      this.movimientoService
        .actualizarMovimiento(this.seleccionActual.id, movimiento)
        .subscribe({
          next: () => {
            this.cargarMovimientos();
            this.mostrarExito('Movimiento actualizado correctamente');
          },
          error: () => this.mostrarError('Error al actualizar movimiento'),
          complete: () => this.cerrarDialogo(),
        });
    } else {
      this.movimientoService.crearMovimiento(movimiento).subscribe({
        next: () => {
          this.cargarMovimientos();
          this.mostrarExito('Movimiento creado correctamente');
        },
        error: () => this.mostrarError('Error al crear movimiento'),
        complete: () => this.cerrarDialogo(),
      });
    }
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

  filtrarPorTipo(): void {
    const tipo = this.filtroTipo || undefined;
    this.buscarPorFiltro(undefined, tipo);
  }

  buscarPorFiltro(productoId?: number, tipo?: string): void {
    this.cargando = true;
    this.movimientoService.buscarMovimientos(productoId, tipo).subscribe({
      next: (data) => (this.movimientos = data),
      error: () => this.mostrarError('Error al buscar movimientos'),
      complete: () => (this.cargando = false),
    });
  }

  cerrarDialogo(): void {
    this.resetFormulario();
    this.mostrarDialogo = false;
  }

  resetFormulario(): void {
    this.movimientoForm.reset({
      productoId: null,
      tipo: 'ENTRADA',
      cantidad: 0,
      descripcion: '',
    });
    this.seleccionActual = null;
    this.mensajeError = null;
  }

  mostrarExito(detalle: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: detalle,
    });
  }

  mostrarError(detalle: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detalle,
    });
  }
}
