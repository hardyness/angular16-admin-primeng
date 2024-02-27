import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PajakBungaSimpananWajibComponent } from './pajak-bunga-simpanan-wajib.component';

describe('PajakBungaSimpananWajibComponent', () => {
  let component: PajakBungaSimpananWajibComponent;
  let fixture: ComponentFixture<PajakBungaSimpananWajibComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PajakBungaSimpananWajibComponent]
    });
    fixture = TestBed.createComponent(PajakBungaSimpananWajibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
