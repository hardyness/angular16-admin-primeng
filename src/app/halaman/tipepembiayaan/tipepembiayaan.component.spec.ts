import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipepembiayaanComponent } from './tipepembiayaan.component';

describe('TipepembiayaanComponent', () => {
  let component: TipepembiayaanComponent;
  let fixture: ComponentFixture<TipepembiayaanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipepembiayaanComponent]
    });
    fixture = TestBed.createComponent(TipepembiayaanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
