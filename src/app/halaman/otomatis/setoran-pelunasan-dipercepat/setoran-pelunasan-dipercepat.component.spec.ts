import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetoranPelunasanDipercepatComponent } from './setoran-pelunasan-dipercepat.component';

describe('SetoranPelunasanDipercepatComponent', () => {
  let component: SetoranPelunasanDipercepatComponent;
  let fixture: ComponentFixture<SetoranPelunasanDipercepatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetoranPelunasanDipercepatComponent]
    });
    fixture = TestBed.createComponent(SetoranPelunasanDipercepatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
