import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions, CameraResultType } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/storage';

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
    private geolocation: Geolocation,
    private storage: AngularFireStorage, // Agrega AngularFireStorage
  ) {
    this.detalleContacto = {
      nombre: '', apellido: '', ubicacion: '', foto: '',
      numeroCelular: '', correo: ''
    };
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const contactoId = params['id'];

      this.contactosService.obtenerDetallesContacto(contactoId).subscribe(detalle => {
        this.detalleContacto = detalle;
      });
    });
    this.getCurrentCoordinates();
    this.getAddressFromCoords();
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

      if (data.display_name) {
        this.ubicacion = data.display_name;
      } else {
        console.log('No se pudo obtener la dirección.');
      }
    } catch (error) {
      console.error('Error obteniendo la dirección:', error);
    }
  }

  seleccionarFoto() {
    const options: CameraOptions = {
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
    };

    this.deleteImageByUrl();

    Camera.getPhoto(options).then((image) => {
      this.detalleContacto.foto = image.dataUrl;
    }).catch((error) => {
      console.error('Error al seleccionar la foto', error);
    });
  }

  async deleteImageByUrl(): Promise<void> {
    try {
      // Obtener la referencia a la imagen en Firebase Storage usando la URL
      const imageRef = this.storage.storage.refFromURL(this.detalleContacto.foto);

      // Eliminar la imagen
      await imageRef.delete();

      console.log(`Imagen eliminada con éxito: ${this.detalleContacto.foto}`);
    } catch (error) {
      console.error('Error al eliminar la imagen', error);
      throw error; // Puedes propagar el error si es necesario
    }
  }

  guardarContacto() {
    const nuevoContacto: Contacto = {
      ...this.detalleContacto,
      ubicacion: this.ubicacion,
      numeroCelular: this.detalleContacto.numeroCelular,
      correo: this.detalleContacto.correo,
    };

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
