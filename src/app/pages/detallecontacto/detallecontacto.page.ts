import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContactosService, Contacto } from '../../services/contactos.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-detallecontacto',
  templateUrl: './detallecontacto.page.html',
  styleUrls: ['./detallecontacto.page.scss'],
})
export class DetallecontactoPage implements OnInit {
  detalleContacto: Contacto | null;

  constructor(private route: ActivatedRoute, private contactosService: ContactosService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const contactoId = params['id'];

      // Llamar a la función del servicio para obtener detalles del contacto
      this.contactosService.obtenerDetallesContacto(contactoId).subscribe(detalle => {
        // Almacenar el resultado en la propiedad del componente
        this.detalleContacto = detalle;
      });
    });
  }
}
