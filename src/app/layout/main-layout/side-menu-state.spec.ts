import { TestBed } from '@angular/core/testing';
import { StorageService } from '@core/platform/storage.service';
import { SideMenuState } from './side-menu-state';

describe('SideMenuState', () => {
  afterEach(() => TestBed.inject(StorageService).remove('app.menu-pinned'));

  it('starts pinned and remembers when it is collapsed', async () => {
    const state = TestBed.inject(SideMenuState);
    await state.ready;
    expect(state.pinned()).toBe(true);

    state.toggle();

    expect(state.pinned()).toBe(false);
    await vi.waitFor(async () =>
      expect(await TestBed.inject(StorageService).get('app.menu-pinned')).toBe('false'),
    );
  });

  it('applies the saved preference', async () => {
    await TestBed.inject(StorageService).set('app.menu-pinned', 'false');
    const state = TestBed.inject(SideMenuState);

    await state.ready;

    expect(state.pinned()).toBe(false);
  });
});
