import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  it('renders the side menu items inside a split pane', async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular(), provideRouter([])] });
    const fixture = TestBed.createComponent(MainLayout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('ion-split-pane ion-menu')).not.toBeNull();
    expect(element.querySelector('ion-menu ion-item')?.textContent).toContain('Inicio');
    expect(element.querySelector('ion-router-outlet#main-content')).not.toBeNull();
  });
});
