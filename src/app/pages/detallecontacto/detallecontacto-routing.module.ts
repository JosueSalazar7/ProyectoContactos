import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallecontactoPage } from './detallecontacto.page';

const routes: Routes = [
  {
    path: '',
    component: DetallecontactoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallecontactoPageRoutingModule {}
