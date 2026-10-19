import { Component } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
} from '@ionic/angular';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';

@Component({
  selector: 'app-home-page',
  imports: [
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    PageToolbar,
  ],
  templateUrl: './home-page.html',
})
export class HomePage {}
