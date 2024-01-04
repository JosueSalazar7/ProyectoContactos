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
  savedImageFile: any;

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

    this.savedImageFile = await this.savePicture(capturedPhoto);
    console.log("==============", this.savedImageFile)
    // Add new photo to Photos array
    this.photos.unshift(this.savedImageFile);

    // await this.savePictureURL(capturedPhoto);
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


  // uploadImage(file: any, path: string, nombre: string): Promise<String> {
  //   return new Promise(resolve => {
  //     const filePath = path + '/' + this.nombre;
  //     const ref = this.storage.ref(filePath);
  //     const task = ref.put(file);
  //     task.snapshotChanges().pipe(
  //       finalize(() => {
  //         ref.getDownloadURL().subscribe(res => {
  //           const downloadURL = res;
  //           resolve(downloadURL)
  //           this.foto = downloadURL
  //           return
  //         })
  //       })
  //     )
  //   })
  // }

  // async uploadImage(captu: Photo) {
  //   const savedImageFile = await this.savePicture(captu);
  //   const webPath = savedImageFile.webviewPath;

  //   // Fetch the image as Blob
  //   const blob = await fetch(webPath).then((res) => res.blob());

  //   // Storage path
  //   const fileStoragePath = `filesStorage/${new Date().getTime()}_${savedImageFile.filepath}`;

  //   // Image reference
  //   const imageRef = this.storage.ref(fileStoragePath);
  //   // File upload task
  //   const uploadTask = imageRef.put(blob);

  //   uploadTask.snapshotChanges().pipe(
  //     finalize(()=>{
  //       imageRef.getDownloadURL().subscribe( res =>{
  //         const downloadURL = res;
  //         console.log(downloadURL)
  //         resolve(downloadURL);
  //         return
  //       })
  //     })
  //   )
  //   // Show uploading progress
  //   // this.trackSnapshot = uploadTask.snapshotChanges().pipe(
  //   //   finalize(async () => {
  //   //     // Retrieve uploaded image storage path
  //   //     const uploadedImageURL = await imageRef.getDownloadURL().toPromise();
  //   //     console.log("IMAGENULT - - - - ", uploadedImageURL);
  //   //     // Use the value when the Observable completes
  //   //     this.foto = uploadedImageURL
  //   //     this.storeFilesFirebase({
  //   //       name: savedImageFile.filepath,
  //   //       filepath: uploadedImageURL,
  //   //     });

  //   //     this.isFileUploading = false;
  //   //   }),
  //   //   tap((snap: any) => {
  //   //     this.imgSize = snap.totalBytes;
  //   //   })
  //   // );
  // }
  async uploadImage(): Promise<void> {
    try {
      const webPath = this.savedImageFile.webviewPath;

      // Fetch the image as Blob
      const blob = await fetch(webPath).then((res) => res.blob());

      // Storage path
      const fileStoragePath = `filesStorage/${new Date().getTime()}_${this.savedImageFile.filepath}`;

      // Image reference
      const imageRef = this.storage.ref(fileStoragePath);

      // File upload task
      const uploadTask = imageRef.put(blob);

      // Wait for the snapshotChanges to complete
      await uploadTask.snapshotChanges().pipe(
        finalize(() => {
          imageRef.getDownloadURL().subscribe((res) => {
            const downloadURL = res;
            console.log(downloadURL);
            this.foto = downloadURL
            // Use the downloadURL as needed
          });
        })
      ).toPromise(); // Convert the observable to a promise
    } catch (error) {
      console.error('Error in uploadImage', error);
    }
  }


  storeFilesFirebase(arg0: { name: string; filepath: any; }) {
    throw new Error('Method not implemented.');
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
  async guardarContacto() {
    try {
      await this.uploadImage();
      console.log("Entrooooooooooooo", this.foto);

      const nuevoContacto: Contacto = {
        id: '',
        nombre: this.nombre,
        apellido: this.apellido,
        ubicacion: this.ubicacion,
        foto: this.foto,
        numeroCelular: this.numeroCelular,
        correo: this.correo,
      };

      console.log("Nuevo contacto", nuevoContacto);

      // Verificar si la propiedad 'foto' tiene un valor antes de agregar el contacto
      if (this.foto) {
        await this.contactosService.agregarContacto(nuevoContacto);
        this.router.navigateByUrl('/contactos');
      } else {
        console.error('La propiedad "foto" está indefinida.');
        this.guardarContacto()
      }
    } catch (error) {
      console.error('Error al guardar el contacto', error);
    }
  }
}
export interface UserPhoto {
  filepath: string;
  webviewPath: string;
}