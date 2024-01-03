import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-edit-contacto',
  templateUrl: './edit-contacto.page.html',
  styleUrls: ['./edit-contacto.page.scss'],
})
export class EditContactoPage implements OnInit {
  detalleContacto: Contacto | null;
  id: string;
  latitude: any;
  longitude: any;
  ubicacion: string;

  constructor(
    private route: ActivatedRoute,
    private contactosService: ContactosService,
    private router: Router,
    private geolocation: Geolocation
  ) {
    this.detalleContacto = { nombre: '', apellido: '', ubicacion: '', foto: '', numeroCelular: '', correo: '' };
  }


  ngOnInit() {
    this.route.params.subscribe(params => {
      const contactoId = params['id'];

      // Llamar a la función del servicio para obtener detalles del contacto
      this.contactosService.obtenerDetallesContacto(contactoId).subscribe(detalle => {
        // Almacenar el resultado en la propiedad del componente
        this.detalleContacto = detalle;
      });
    });
    this.getCurrentCoordinates();
    this.getAddressFromCoords(); // Llamada directa al inicio de la página

  }
  getCurrentCoordinates() {
    const options = {
      timeout: 10000,
      enableHighAccuracy: true,
      maximumAge: 3600,
    };

    this.geolocation
      .getCurrentPosition(options)
      .then((resp) => {
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.getAddressFromCoords();
      })
      .catch((error) => {
        console.log('Error, no se puede obtener tu ubicación', error);
      });
  }

  async getAddressFromCoords() {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitude}&lon=${this.longitude}`);
      const data = await response.json();

      // Asumiendo que 'display_name' es el campo que contiene la dirección
      if (data.display_name) {
        this.ubicacion = data.display_name;
      } else {
        console.log('No se pudo obtener la dirección.');
      }
    } catch (error) {
      console.error('Error obteniendo la dirección:', error);
    }
  }
  guardarContacto() {
    const nuevoContacto: Contacto = {
      ...this.detalleContacto, // Copia las propiedades existentes del contacto
      nombre: this.detalleContacto.nombre,
      apellido: this.detalleContacto.apellido,
      ubicacion: this.ubicacion,
      foto: this.detalleContacto.foto,
      numeroCelular: this.detalleContacto.numeroCelular,
      correo: this.detalleContacto.correo,
    };

    // Usar el id del detalleContacto
    this.contactosService
      .actualizarContacto(this.detalleContacto.id, nuevoContacto)
      .then(() => {
        this.router.navigateByUrl('/contactos');
      })
      .catch((error) => {
        console.error('Error al actualizar contacto', error);
      });
  }
}
