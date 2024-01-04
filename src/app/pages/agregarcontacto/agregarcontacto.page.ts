import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { ActionSheetController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
  foto: Observable<any>;
  numeroCelular: string;
  correo: string;
  latitude: any;
  longitude: any;
  photo: UserPhoto

  constructor(
    private contactosService: ContactosService,
    private router: Router,
    private geolocation: Geolocation,
    private platform: Platform,
    public actionSheetController: ActionSheetController,
    private storage: AngularFireStorage, // Agrega AngularFireStorage
    private firestore: AngularFirestore
  ) { }


  ngOnInit() {
    this.getCurrentCoordinates();
    this.getAddressFromCoords(); // Llamada directa al inicio de la página
  }
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
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


  public async showActionSheet(position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deletePicture(this.photo, position);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }]
    });
    await actionSheet.present();
  }
  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100, // highest quality (0 to 100)
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    console.log("==============", savedImageFile)
    // Add new photo to Photos array
    this.photos.unshift(savedImageFile);

    await this.savePictureURL(capturedPhoto);
    // Cache all photo data for future retrieval
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
  }
  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: photo.webPath,
      };
    }
  }
  private async savePictureURL(photo: Photo) {
    try {
      // Convert photo to base64 format
      const base64Data = await this.readAsBase64(photo);

      // Generate a unique filename
      const fileName = new Date().getTime() + '.jpeg';

      // Write the file to the data directory
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });

      // Upload the file to Firebase Storage
      const storagePath = `fotos/${fileName}`;
      const storageRef = this.storage.ref(storagePath);
      console.log("saveeee", savedFile.uri)
      await storageRef.put(savedFile.uri, { contentType: 'image/jpeg' });

      // Get the download URL
      const downloadURL = await storageRef.getDownloadURL();
      console.log(downloadURL)
      // Set the photo properties
      this.foto = downloadURL;
    } catch (error) {
      console.error('Error saving picture:', error);
      throw error; // Propagate the error
    }
  }



  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  // Delete picture by removing it from reference data and the filesystem
  public async deletePicture(photo: UserPhoto, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
    this.convertBlobToBase64 = (blob: Blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });

    // delete photo file from filesystem
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await Filesystem.deleteFile({
      path: filename,
      directory: Directory.Data,
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
    const nuevoContacto: Contacto = {
      id: '',
      nombre: this.nombre,
      apellido: this.apellido,
      ubicacion: this.ubicacion,
      foto: { filepath: "", webviewPath: "" }, // Ajusta el tipo de la propiedad foto
      numeroCelular: this.numeroCelular,
      correo: this.correo,
    };

    // Suscríbete a la Observable para obtener la URL y asignarla al campo foto
    this.foto.subscribe(
      (url) => {
        nuevoContacto.foto = url;
        // Ahora puedes llamar a la función que agrega el contacto con el nuevoContacto
        this.contactosService.agregarContacto(nuevoContacto)
          .then(() => {
            this.router.navigateByUrl('/contactos');
          })
          .catch((error) => {
            console.error('Error al agregar contacto', error);
          });
      },
      (error) => {
        console.error('Error al obtener la URL de la foto', error);
      }
    );
  }

}
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}