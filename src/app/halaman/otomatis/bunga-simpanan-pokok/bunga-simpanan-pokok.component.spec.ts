import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BungaSimpananPokokComponent } from './bunga-simpanan-pokok.component';

describe('BungaSimpananPokokComponent', () => {
  let component: BungaSimpananPokokComponent;
  let fixture: ComponentFixture<BungaSimpananPokokComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BungaSimpananPokokComponent]
    });
    fixture = TestBed.createComponent(BungaSimpananPokokComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
