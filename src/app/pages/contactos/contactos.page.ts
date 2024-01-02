import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.page.html',
  styleUrls: ['./contactos.page.scss'],
})
export class ContactosPage {

  constructor(private navCtrl: NavController) {}

  agregarContacto() {
    // Lógica para redirigir a la página de agregar contacto
    this.navCtrl.navigateForward('/agregarcontacto');
  }
  verDetalles(contactoId: number) {
    this.navCtrl.navigateForward(`/detallecontacto/${contactoId}`);
  }
}
