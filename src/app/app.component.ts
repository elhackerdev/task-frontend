import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';

import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ToastModule, ConfirmDialogModule, ButtonModule, RouterOutlet],
  providers: [MessageService, ConfirmationService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private primeng: PrimeNG) {}
  title = 'Tareas';
  ngOnInit() {
    this.primeng.ripple.set(true);
  }
}
