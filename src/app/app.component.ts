import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet,ToastModule,ConfirmDialogModule],
    providers:[MessageService,ConfirmationService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private primeng: PrimeNG) {}
  title = 'Campidev';
  ngOnInit() {
    this.primeng.ripple.set(true);
}

menuOpen = false;

toggleMenu() {
  this.menuOpen = !this.menuOpen;
}

}
