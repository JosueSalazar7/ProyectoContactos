import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-agregarcontacto',
  templateUrl: './agregarcontacto.page.html',
  styleUrls: ['./agregarcontacto.page.scss'],
})
export class AgregarcontactoPage implements OnInit {
  id?: string;
  idClient?: string; 
  nombre: string;
  apellido: string;
  ubicacion: string;
  foto: string;
  numeroCelular: string;
  correo: string;
  latitude: any;
  longitude: any;

  constructor(
    private contactosService: ContactosService,
    private router: Router,
    private geolocation: Geolocation
  ) {}

  ngOnInit() {
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
    console.log("Entrooooooooooooo")
    const nuevoContacto: Contacto = {
      id: '',
      nombre: this.nombre,
      apellido: this.apellido,
      ubicacion: this.ubicacion,
      foto: this.foto,
      numeroCelular: this.numeroCelular,
      correo: this.correo,
    };
    console.log("Nuevo contacto", nuevoContacto)
    this.contactosService.agregarContacto(nuevoContacto)
      .then(() => {
        this.router.navigateByUrl('/contactos');
      })
      .catch((error) => {
        console.error('Error al agregar contacto', error);
      });
  }
}
