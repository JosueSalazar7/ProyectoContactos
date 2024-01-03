import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ContactosService, Contacto } from '../../services/contactos.service'; // Asegúrate de proporcionar la ruta correcta

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.page.html',
  styleUrls: ['./contactos.page.scss'],
})
export class ContactosPage {
  contactos: Contacto[]; // Asegúrate de tener esta variable definida

  constructor(
    private navCtrl: NavController,
    private contactosService: ContactosService // Agrega esta línea
  ) { }

  ngOnInit() {
    this.obtenerListaContactos(); // Llama a la función para obtener la lista de contactos al inicializar el componente
  }

  agregarContacto() {
    this.navCtrl.navigateForward('/agregarcontacto');
  }

  verDetalles(contactoId: string) {
    console.error(contactoId)
    this.navCtrl.navigateForward(`/detallecontacto/${contactoId}`);
  }

  editarContacto(contactoId: string) {
    this.navCtrl.navigateForward(`/edit-contacto/${contactoId}`);
  }
  eliminarContacto(contactoId: string) {
    console.error("ContactId", contactoId)
    this.contactosService.eliminarContacto(contactoId)
      .then(() => {
        // Actualiza la lista de contactos después de la eliminación
        this.obtenerListaContactos();
      })
      .catch((error) => {
        // Maneja el error, si es necesario
        console.error('Error al eliminar el contacto:', error);
      });
  }
  private obtenerListaContactos() {
    this.contactosService.obtenerListaContactos().subscribe(
      (contactos) => {
        this.contactos = contactos;
      },
      (error) => {
        console.error('Error al obtener lista de contactos:', error);
      }
    );
  }

}
