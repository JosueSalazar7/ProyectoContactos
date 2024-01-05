import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

export interface User {
  uid: string;
  email: string;
}

export interface Contacto {
  id?: string;
  idCliente?: string; // Nuevo campo para el ID del cliente
  nombre: string;
  apellido: string;
  ubicacion: string;
  foto: string; // Ajusta el tipo de la propiedad foto
  numeroCelular: string;
  correo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactosService {
  currentUser: User = null;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore, private storage:
      AngularFireStorage, // Agrega AngularFireStorage
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

  }
  isLoggedIn(): boolean {
    const isLoggedIn = !!this.afAuth.currentUser;
    console.log('Is user logged in?', isLoggedIn);
    return isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
  async signup({ email, password }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );

    console.log('results', credential);
    const uid = credential.user.uid;

    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user.email,
    })
  }


  signIn(credentials: { email: string; password: string }): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  // Funcionalidad de Contactos

  agregarContacto(contacto: Contacto): Promise<void> {
    const idCliente = this.currentUser.uid;
    const idContacto = this.afs.createId();

    // Asignar los IDs al contacto
    contacto.id = idContacto;
    contacto.idCliente = idCliente;


    return this.afs.collection<Contacto>('contactos').doc(idContacto).set(contacto);
  }




  obtenerListaContactos(): Observable<Contacto[]> {
    // Obtén el UID del usuario actual
    const currentUserUid = this.currentUser ? this.currentUser.uid : null;

    // Si no hay un usuario actual, devuelve un Observable vacío
    if (!currentUserUid) {
      return of([]);
    }

    // Utiliza el método 'snapshotChanges()' para obtener cambios en tiempo real
    return this.afs.collection<Contacto>('contactos', ref => ref.where('idCliente', '==', currentUserUid))
      .snapshotChanges()
      .pipe(
        map(actions => {
          // Mapea los cambios para obtener los datos de cada contacto
          return actions.map(action => {
            const data = action.payload.doc.data() as Contacto;
            const id = action.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }


  obtenerDetallesContacto(contactoId: string): Observable<Contacto | null> {
    // Comprobar si el contactoId está presente
    if (!contactoId) {
      console.error('El ID del contacto no puede estar vacío.');
      return of(null);
    }

    const documentRef = this.afs.collection<Contacto>('contactos').doc(contactoId);

    return documentRef.get().pipe(
      map(doc => {
        if (doc.exists) {
          // Documento encontrado, devolver datos
          return doc.data() as Contacto;
        } else {
          // Documento no encontrado
          console.error('El documento no existe.');
          return null;
        }
      }),
      catchError(error => {
        // Manejar errores
        console.error('Error al obtener el documento:', error);
        return of(null);
      })
    );
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    try {
      // Obtener la referencia a la imagen en Firebase Storage usando la URL
      const imageRef = this.storage.storage.refFromURL(imageUrl);

      // Eliminar la imagen
      await imageRef.delete();

      console.log(`Imagen eliminada con éxito: ${imageUrl}`);
    } catch (error) {
      console.error('Error al eliminar la imagen', error);
      throw error; // Puedes propagar el error si es necesario
    }
  }



  eliminarContacto(contactoId: string, fotos: string): Promise<void> {
    this.deleteImageByUrl(fotos)
    const documentRef = this.afs.collection<Contacto>('contactos').doc(contactoId);
    console.error("- -- - - -", documentRef)
    console.log("===========", documentRef)
    return documentRef.delete();

  }

  async actualizarContacto(contactoId: string, datosActualizados: any): Promise<void> {
    return this.afs.collection('contactos').doc(contactoId).update(datosActualizados)
      .then(() => {
        console.log('Contacto actualizado con éxito');
      })
      .catch((error) => {
        console.error('Error al actualizar contacto:', error);
      });
  }

}
