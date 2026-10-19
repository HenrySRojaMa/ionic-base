import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { App } from './app';

describe('App', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideIonicAngular(), provideRouter([])] }),
  );

  it('hosts the Ionic router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('ion-app ion-router-outlet')).not.toBeNull();
  });
});
