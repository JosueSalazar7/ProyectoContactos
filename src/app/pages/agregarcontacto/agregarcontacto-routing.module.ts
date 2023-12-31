import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarcontactoPage } from './agregarcontacto.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarcontactoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarcontactoPageRoutingModule {}
