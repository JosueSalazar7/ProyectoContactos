import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DetallecontactoPage } from './detallecontacto.page';

describe('DetallecontactoPage', () => {
  let component: DetallecontactoPage;
  let fixture: ComponentFixture<DetallecontactoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallecontactoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallecontactoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
