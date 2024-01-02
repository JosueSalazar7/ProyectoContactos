import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';

@Component({
  selector: 'app-agregarcontacto',
  templateUrl: './agregarcontacto.page.html',
  styleUrls: ['./agregarcontacto.page.scss'],
})
export class AgregarcontactoPage implements OnInit {
  // Define las propiedades del nuevo contacto
  nombre: string;
  apellido: string;
  ubicacion: string;
  foto: string;
  numeroCelular: string;
  correo: string;

  constructor(private contactosService: ContactosService, private router: Router) { }

  ngOnInit() {
  }

  // Método para guardar el contacto
  guardarContacto() {
    // Crea un objeto de tipo Contacto con los datos del formulario
    const nuevoContacto: Contacto = {
      id: '', // Puedes generar un ID o utilizar el que provee Firestore al agregar el documento
      nombre: this.nombre,
      apellido: this.apellido,
      ubicacion: this.ubicacion,
      foto: this.foto,
      numeroCelular: this.numeroCelular,
      correo: this.correo,
    };

    // Llama al servicio para agregar el nuevo contacto
    this.contactosService.agregarContacto(nuevoContacto)
      .then(() => {
        // Después de agregar el contacto, navega de nuevo a la página de contactos
        this.router.navigateByUrl('/contactos');
      })
      .catch((error) => {
        // Maneja cualquier error que pueda ocurrir durante la operación
        console.error('Error al agregar contacto', error);
      });
  }
}
