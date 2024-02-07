import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { halamanGuard } from './halaman.guard';

describe('halamanGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => halamanGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
