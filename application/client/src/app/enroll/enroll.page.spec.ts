import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EnrollPage } from './enroll.page';

describe('EnrollPage', () => {
  let component: EnrollPage;
  let fixture: ComponentFixture<EnrollPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrollPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EnrollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
