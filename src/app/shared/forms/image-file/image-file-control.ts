import { Component, computed, inject, input, signal } from '@angular/core';
import { IonButton, IonIcon, IonNote } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, closeOutline } from 'ionicons/icons';
import { BaseControl } from '../base-control';
import { ControlLabel } from '../control-label/control-label';
import { IMAGE_PICKER } from './image-picker';

/**
 * Qué valor entrega el control:
 * - dataUrl: "data:image/jpeg;base64,..." (se puede mostrar directo en un <img>)
 * - base64:  solo la parte base64, sin el prefijo
 * - file:    el objeto File (para enviar como multipart/form-data)
 */
export type ImageValueMode = 'dataUrl' | 'base64' | 'file';

export type ImageValue = string | File;

/**
 * Selector de imagen con vista previa. Misma API que en las bases web, pero en
 * vez de <input type="file"> usa IMAGE_PICKER: cámara o galería en el teléfono,
 * selector de archivos en web. Al editar, el valor inicial puede ser la URL de
 * la imagen guardada: se muestra.
 */
@Component({
  selector: 'app-image-file',
  imports: [IonButton, IonIcon, IonNote, ControlLabel],
  templateUrl: './image-file-control.html',
})
export class ImageFileControl extends BaseControl<ImageValue> {
  readonly mode = input<ImageValueMode>('dataUrl');
  /** Tamaño máximo en KB, comprobado DESPUÉS de reducir la imagen a maxWidth. */
  readonly maxSizeKb = input<number | null>(null);
  /** Ancho máximo en px: el dispositivo reduce la foto antes de entregarla. */
  readonly maxWidth = input(1280);

  private readonly picker = inject(IMAGE_PICKER);
  private readonly pickedPreview = signal<string | null>(null);
  protected readonly localError = signal<string | null>(null);
  protected readonly busy = signal(false);

  /** Derivada: la imagen elegida o, si no hay, la URL que trae el valor (modo edición). */
  protected readonly preview = computed(() => {
    const picked = this.pickedPreview();
    if (picked) return picked;
    const value = this.value();
    return typeof value === 'string' && isDisplayableUrl(value) ? value : null;
  });

  protected readonly displayedError = computed(() => this.localError() ?? this.errorMessage());

  constructor() {
    super();
    addIcons({ cameraOutline, closeOutline });
  }

  protected async pick(): Promise<void> {
    this.busy.set(true);
    try {
      const file = await this.picker.pickImage({ maxWidth: this.maxWidth() });
      if (file) await this.accept(file);
    } finally {
      this.busy.set(false);
      this.markAsTouched();
    }
  }

  protected clear(): void {
    this.pickedPreview.set(null);
    this.localError.set(null);
    this.value.set(null);
    this.markAsTouched();
  }

  private async accept(file: File): Promise<void> {
    const max = this.maxSizeKb();
    if (max !== null && file.size > max * 1024) {
      this.localError.set(`La imagen no puede superar los ${max} KB.`);
      return;
    }
    this.localError.set(null);
    const dataUrl = await readAsDataUrl(file);
    this.pickedPreview.set(dataUrl);
    this.value.set(this.toValue(file, dataUrl));
  }

  private toValue(file: File, dataUrl: string): ImageValue {
    switch (this.mode()) {
      case 'file':
        return file;
      case 'base64':
        return dataUrl.substring(dataUrl.indexOf(',') + 1);
      default:
        return dataUrl;
    }
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isDisplayableUrl(value: string): boolean {
  return /^(data:image\/|https?:\/\/|\/|assets\/|blob:|capacitor:\/\/)/.test(value);
}
