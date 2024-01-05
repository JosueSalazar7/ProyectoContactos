import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraResultType, CameraOptions, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

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
  photo: UserPhoto
  trackSnapshot: Observable<unknown>;
  isFileUploading: boolean;
  imgSize: any;
  disableButton: Boolean;
  constructor(
    private contactosService: ContactosService,
    private router: Router,
    private geolocation: Geolocation,
    private platform: Platform,
    public actionSheetController: ActionSheetController,
    private storage: AngularFireStorage, // Agrega AngularFireStorage
  ) { }


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

  public async addNewToGallery() {
    // Take a photo
    const options: CameraOptions = {
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
    };

    Camera.getPhoto(options).then((image) => {
      this.foto = image.dataUrl;
    }).catch((error) => {
      console.error('Error al seleccionar la foto', error);
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

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  guardarContacto() {
    console.log("Entrooooooooooooo==", this.foto);

    this.contactosService.agregarContacto(
      this.foto,
      this.nombre,
      this.apellido,
      this.ubicacion,
      this.numeroCelular,
      this.correo,
      this.id,
      this.idClient
    )

  }
}
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}