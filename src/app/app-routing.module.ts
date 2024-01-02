import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
 
// Enviar a los usuarios sin autenticarse a la raiz (LogIn)
const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['/']);
 
//Redirige a los usuarios autenticados a la vista chat.
const redirectLoggedInToChat = () => redirectLoggedInTo(['/contactos']);
 
const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'contactos',
    loadChildren: () => import('./pages/contactos/contactos.module').then( m => m.ContactosPageModule)
  },
  {
    path: 'agregarcontacto',
    loadChildren: () => import('./pages/agregarcontacto/agregarcontacto.module').then( m => m.AgregarcontactoPageModule)
  },  {
    path: 'detallecontacto',
    loadChildren: () => import('./pages/detallecontacto/detallecontacto.module').then( m => m.DetallecontactoPageModule)
  },


];
 
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }