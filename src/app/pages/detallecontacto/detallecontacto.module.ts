import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallecontactoPageRoutingModule } from './detallecontacto-routing.module';

import { DetallecontactoPage } from './detallecontacto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallecontactoPageRoutingModule
  ],
  declarations: [DetallecontactoPage]
})
export class DetallecontactoPageModule {}
