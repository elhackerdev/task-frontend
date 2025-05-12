import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

// Services
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoService } from '../../core/services/movimiento.service';

// Interfaces
import { Producto } from '../../interfaces/Producto';
import { Movimiento } from '../../interfaces/Movimiento';

/**
 * Componente para gestión de productos y movimientos de inventario
 * 
 * Features:
 * - CRUD completo de productos
 * - Registro de movimientos de entrada/salida
 * - Filtrado de productos
 * - Notificaciones con PrimeNG Toast
 */
@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG Modules
    DialogModule,
    TableModule,
    ToastModule,
    ButtonModule
  ],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit {
  // Estado del componente
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  loading: boolean = false;
  
  // Control de diálogos
  dialogVisible: boolean = false;
  dialogoMovimientoVisible = false;
  
  // Filtros
  filtroNombre!: string;
  filtroCategoria!: string;
  filtroCodigo!: string;
  
  // ID para movimientos
  productoIdParaMovimiento!: number;

  // Formularios
  productoForm!: FormGroup;
  movimientoForm!: FormGroup;

  constructor(
    private productoService: ProductoService,
    private movimientoService: MovimientoService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    // Inicialización de formularios
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  // --------------------------
  // Inicialización
  // --------------------------
  
  private inicializarFormularios(): void {
    this.productoForm = this.fb.group({
      id: [],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });

    this.movimientoForm = this.fb.group({
      tipo: ['ENTRADA', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
    });
  }

  // --------------------------
  // Operaciones CRUD Productos
  // --------------------------

  cargarProductos(nombre?: string, categoria?: string, codigo?: string): void {
    this.loading = true;
    this.productoService.obtenerProductos(nombre, categoria, codigo).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.mostrarError('Error al cargar productos');
      },
    });
  }

  crear(producto: Producto): void {
    this.productoService.crearProducto(producto).subscribe({
      next: (data) => {
        this.productos.push(data);
        this.dialogVisible = false;
        this.mostrarExito('Producto creado exitosamente');
      },
      error: (err) => this.mostrarError(err.error || 'Error al crear el producto')
    });
  }

  actualizar(producto: Producto): void {
    if (!this.productoSeleccionado?.id) return;

    this.productoService.actualizarProducto(this.productoSeleccionado.id, producto).subscribe({
      next: (actualizado) => {
        const index = this.productos.findIndex(p => p.id === actualizado.id);
        if (index > -1) this.productos[index] = actualizado;
        this.dialogVisible = false;
        this.mostrarExito('Producto actualizado exitosamente');
      },
      error: () => this.mostrarError('Error al actualizar producto'),
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.mostrarExito('Producto eliminado exitosamente');
      },
      error: () => this.mostrarError('Error al eliminar producto'),
    });
  }

  // --------------------------
  // Gestión de Movimientos
  // --------------------------

  abrirDialogoMovimiento(productoId: number): void {
    this.productoIdParaMovimiento = productoId;
    this.movimientoForm.reset({
      tipo: 'ENTRADA',
      cantidad: 1,
      descripcion: ''
    });
    this.dialogoMovimientoVisible = true;
  }

  registrarMovimiento(): void {
    if (this.movimientoForm.invalid) return;

    const movimiento: Movimiento = {
      ...this.movimientoForm.value,
      idProducto: this.productoIdParaMovimiento,
      fecha: new Date().toISOString()
    };

    this.movimientoService.crearMovimiento(movimiento).subscribe({
      next: (respuesta: any) => {
        this.cargarProductos();
        this.mostrarExito('Movimiento registrado correctamente');
        
        if (respuesta.stockBajo) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stock bajo',
            detail: `El producto "${respuesta.nombreProducto}" tiene solo ${respuesta.cantidad} unidades.`            
          });
        }

        this.dialogoMovimientoVisible = false;
      },
      error: (err) => this.mostrarError(err.error || 'Error al crear el Movimiento')
    });
  }

  // --------------------------
  // Métodos Auxiliares
  // --------------------------

  buscar(nombre?: string, categoria?: string, codigo?: string): void {
    this.cargarProductos(nombre, categoria, codigo);
  }

  abrirDialogoNuevo(): void {
    this.productoForm.reset();
    this.productoSeleccionado = null;
    this.dialogVisible = true;
  }

  editar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.productoForm.patchValue(producto);
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.productoForm.invalid) return;

    const producto: Producto = this.productoForm.value;
    this.productoSeleccionado?.id ? this.actualizar(producto) : this.crear(producto);
  }

  // --------------------------
  // Helpers de Notificación
  // --------------------------

  private mostrarExito(mensaje: string): void {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: mensaje 
    });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: mensaje 
    });
  }
}