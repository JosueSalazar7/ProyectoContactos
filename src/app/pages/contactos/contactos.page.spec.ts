import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContactosPage } from './contactos.page';

describe('ContactosPage', () => {
  let component: ContactosPage;
  let fixture: ComponentFixture<ContactosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
