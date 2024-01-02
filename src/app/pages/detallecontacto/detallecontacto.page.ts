import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactosService } from '../../services/contactos.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-detallecontacto',
  templateUrl: './detallecontacto.page.html',
  styleUrls: ['./detallecontacto.page.scss'],
})
export class DetallecontactoPage implements OnInit {
  contacto: any; // Asegúrate de que el tipo 'contacto' coincida con tus datos

  constructor(private route: ActivatedRoute, private contactosService: ContactosService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const contactoId = params.get('contactoId'); // Ajusta el nombre según cómo lo hayas definido en tus rutas
      this.contactosService.obtenerDetallesContacto(contactoId).subscribe(detalle => {
        this.contacto = detalle;
      });
    });
  }
}
