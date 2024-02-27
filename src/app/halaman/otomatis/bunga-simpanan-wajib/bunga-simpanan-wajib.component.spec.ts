import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BungaSimpananWajibComponent } from './bunga-simpanan-wajib.component';

describe('BungaSimpananWajibComponent', () => {
  let component: BungaSimpananWajibComponent;
  let fixture: ComponentFixture<BungaSimpananWajibComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BungaSimpananWajibComponent]
    });
    fixture = TestBed.createComponent(BungaSimpananWajibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
