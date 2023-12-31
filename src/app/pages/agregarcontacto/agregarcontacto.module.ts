import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarcontactoPageRoutingModule } from './agregarcontacto-routing.module';

import { AgregarcontactoPage } from './agregarcontacto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarcontactoPageRoutingModule
  ],
  declarations: [AgregarcontactoPage]
})
export class AgregarcontactoPageModule {}
