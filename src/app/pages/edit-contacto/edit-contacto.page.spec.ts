import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditContactoPage } from './edit-contacto.page';

describe('EditContactoPage', () => {
  let component: EditContactoPage;
  let fixture: ComponentFixture<EditContactoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditContactoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditContactoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
