import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditContactoPageRoutingModule } from './edit-contacto-routing.module';

import { EditContactoPage } from './edit-contacto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditContactoPageRoutingModule
  ],
  declarations: [EditContactoPage]
})
export class EditContactoPageModule { }
