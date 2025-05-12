import { Routes } from '@angular/router';
import { MovimientoComponent } from './components/movimiento/movimiento.component';
import { ProductoComponent } from './components/producto/producto.component';


export const routes: Routes = [
    { path: 'movimientos', component: MovimientoComponent }, 
    { path: 'productos', component: ProductoComponent }, 
];
