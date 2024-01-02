import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  apellido: string;
  ubicacion: string;
  foto: string;
  numeroCelular: string;
  correo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactosService {
  currentUser: User = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) { 
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser = user;      
    });
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
 
  signIn({ email, password }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }
 
  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
 
  // Funcionalidad de Contactos
 
  agregarContacto(contacto: Contacto): Promise<DocumentReference<Contacto>> {
    return this.afs.collection<Contacto>('contactos').add(contacto);
  }
 
  obtenerListaContactos(): Observable<Contacto[]> {
    return this.afs.collection<Contacto>('contactos').valueChanges({ idField: 'id' }) as Observable<Contacto[]>;
  }
 
  obtenerDetallesContacto(contactoId: string): Observable<Contacto> {
    return this.afs.collection<Contacto>('contactos').doc(contactoId).valueChanges() as Observable<Contacto>;
  }
}
