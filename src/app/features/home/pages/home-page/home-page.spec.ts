import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { PlatformService } from '@core/platform/platform.service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  async function setup(platform: PlatformService) {
    TestBed.configureTestingModule({
      providers: [provideIonicAngular(), { provide: PlatformService, useValue: platform }],
    });
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the web platform in the browser', async () => {
    const element = await setup({ platform: 'web', isNative: false });
    expect(element.querySelector('.platform')?.textContent).toContain('Web (navegador)');
  });

  it('shows the native platform inside the app', async () => {
    const element = await setup({ platform: 'android', isNative: true });
    expect(element.querySelector('.platform')?.textContent).toContain('Android');
    expect(element.textContent).toContain('Sí');
  });
});
