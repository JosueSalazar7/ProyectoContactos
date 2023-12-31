import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-agregarcontacto',
  templateUrl: './agregarcontacto.page.html',
  styleUrls: ['./agregarcontacto.page.scss'],
})
export class AgregarcontactoPage { // Cambia el nombre de la clase a 'AgregarcontactoPage'
  nombre: string;
  apellido: string;
  ubicacion: string;
  foto: string;
  numeroCelular: string;
  correo: string;

  constructor(private navCtrl: NavController) {}

  guardarContacto() {
    // Aquí puedes implementar la lógica para guardar el contacto
    // Puedes acceder a los valores de los campos a través de las propiedades del componente (this.nombre, this.apellido, etc.)
  }
}
