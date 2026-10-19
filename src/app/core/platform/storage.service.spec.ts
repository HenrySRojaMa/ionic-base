import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  // En las pruebas (jsdom = "web") Capacitor Preferences usa localStorage.
  it('stores, reads and removes values', async () => {
    const storage = TestBed.inject(StorageService);

    await storage.set('demo', 'valor');
    expect(await storage.get('demo')).toBe('valor');

    await storage.remove('demo');
    expect(await storage.get('demo')).toBeNull();
  });
});
