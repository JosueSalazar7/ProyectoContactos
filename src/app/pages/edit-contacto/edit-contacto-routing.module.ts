import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditContactoPage } from './edit-contacto.page';

const routes: Routes = [

  {
    path: '',
    component: EditContactoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditContactoPageRoutingModule { }
