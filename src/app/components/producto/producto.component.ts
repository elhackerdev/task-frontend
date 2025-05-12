import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../interfaces/Producto';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MovimientoService } from '../../core/services/movimiento.service';
import { Movimiento } from '../../interfaces/Movimiento';

@Component({
  selector: 'app-producto',
  imports: [FormsModule,CommonModule,ReactiveFormsModule,DialogModule,TableModule,ToastModule,ButtonModule],
  standalone:true,
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  productoForm: FormGroup;
  productoSeleccionado: Producto | null = null;
  dialogVisible: boolean = false;
  loading: boolean = false;

   movimientoForm!: FormGroup;
  dialogoMovimientoVisible = false;
  productoIdParaMovimiento!: number;

  constructor(
    private productoService: ProductoService,
    private movimientoService: MovimientoService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.productoForm = this.fb.group({
      id: [],
      nombre: ['', Validators.required],
      categoria: ['', Validators.required],
      codigo: ['', Validators.required],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
    });

    this.movimientoForm = this.fb.group({
      tipo: ['ENTRADA', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      descripcion: ['', Validators.required],
    });
  }
  

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
      idProducto: this.productoIdParaMovimiento ,
      fecha: new Date().toISOString()
    };

    this.movimientoService.crearMovimiento(movimiento).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Movimiento registrado correctamente'
        });
        this.dialogoMovimientoVisible = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el movimiento'
        });
      }
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.productoService.obtenerProductos().subscribe({
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

  buscar(nombre?: string, categoria?: string, codigo?: string): void {
    this.loading = true;
    this.productoService.obtenerProductos(nombre, categoria, codigo).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.mostrarError('Error al buscar productos');
      },
    });
  }

  abrirDialogoNuevo(): void {
    this.productoForm.reset();
    this.productoSeleccionado = null;
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.productoForm.invalid) return;

    const producto: Producto = this.productoForm.value;

    if (this.productoSeleccionado?.id) {
      this.actualizar(producto);
    } else {
      this.crear(producto);
    }
  }

  crear(producto: Producto): void {
    this.productoService.crearProducto(producto).subscribe({
      next: (data) => {
        this.productos.push(data);
        this.dialogVisible = false;
        this.mostrarExito('Producto creado exitosamente');
      },
      error: () => this.mostrarError('Error al crear producto'),
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

  editar(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.productoForm.patchValue(producto);
    this.dialogVisible = true;
  }

  mostrarExito(mensaje: string): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: mensaje });
  }

  mostrarError(mensaje: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: mensaje });
  }
}