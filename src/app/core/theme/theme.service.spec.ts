import { TestBed } from '@angular/core/testing';
import { StorageService } from '../platform/storage.service';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;
  let storage: StorageService;

  beforeEach(async () => {
    storage = TestBed.inject(StorageService);
    await storage.remove('app.theme-mode');
  });

  afterEach(async () => {
    const theme = TestBed.inject(ThemeService);
    theme.resetPalette();
    theme.setMode('light');
    TestBed.tick();
    await storage.remove('app.theme-mode');
  });

  it('toggles the Ionic dark palette class and remembers it', async () => {
    const theme = TestBed.inject(ThemeService);
    await theme.ready;

    theme.setMode('light');
    theme.toggleMode();
    // Los effect() se ejecutan en la siguiente detección de cambios: TestBed.tick() la fuerza.
    TestBed.tick();

    expect(theme.mode()).toBe('dark');
    expect(root.classList.contains('ion-palette-dark')).toBe(true);
    await vi.waitFor(async () => expect(await storage.get('app.theme-mode')).toBe('dark'));
  });

  it('applies the saved mode once it is read from storage', async () => {
    await storage.set('app.theme-mode', 'dark');
    const theme = TestBed.inject(ThemeService);

    await theme.ready;

    expect(theme.mode()).toBe('dark');
  });

  it('applies the palette as Ionic variables on <html>', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setPalette({ primary: '#ff0000' });
    TestBed.tick();

    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#ff0000');
  });

  it('removes variables that are no longer part of the palette', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setPalette({ primary: '#ff0000', accent: '#00ff00' });
    TestBed.tick();
    theme.setPalette({ accent: '#00ff00' });
    TestBed.tick();

    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('');
    expect(root.style.getPropertyValue('--ion-color-tertiary')).toBe('#00ff00');
  });
});
