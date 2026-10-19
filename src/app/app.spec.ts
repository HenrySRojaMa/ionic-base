import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { App } from './app';

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideIonicAngular()] }));

  it('renders the Ionic shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('ion-app')).not.toBeNull();
    expect(element.querySelector('ion-title')?.textContent).toContain('ionic-base');
  });
});
