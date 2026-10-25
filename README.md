# Ionic Base

Plantilla base **multiplataforma** (web, Android e iOS) con Ionic 9 + Capacitor 8 sobre Angular 22
moderno. Trae la misma infraestructura que [`angular-modern-base`](../angular-modern-base), sin
lógica de negocio, y una sección **Showcase** que funciona como documentación viva.

| Pieza        | Versión                                               |
| ------------ | ----------------------------------------------------- |
| Angular      | 22.2 (standalone, signals, zoneless, Signal Forms)    |
| Ionic        | 9 (`@ionic/angular`, componentes standalone)          |
| Capacitor    | 8 (Android, iOS, Preferences, Camera)                 |
| Tailwind CSS | 4.3 **solo maquetación** (sin preflight, sin daisyUI) |
| Pruebas      | Vitest + jsdom                                        |
| Node         | ^22.22.3 o ^24.15                                     |

> **Reglas del proyecto:** todo lo que hay que respetar al trabajar sobre esta base (capas, HTTP,
> formularios, estilos, pruebas y commits), con el porqué de cada regla, está en
> [CONVENCIONES.md](CONVENCIONES.md).

## Cómo ejecutarlo

```bash
npm install
npm start          # http://localhost:4200 (la misma app que se publica como web)
```

En desarrollo la app usa un **backend simulado** (`environment.mockApi = true`). Usuario de
prueba: **demo / demo123**.

| Script                | Qué hace                                                   |
| --------------------- | ---------------------------------------------------------- |
| `npm start`           | Servidor de desarrollo                                     |
| `npm run build`       | Build de producción (`dist/ionic-base/browser`): es la web |
| `npm test`            | Pruebas en modo watch (Vitest)                             |
| `npm run test:ci`     | Pruebas una sola vez                                       |
| `npm run lint`        | ESLint (con tipos), incluidas las capas                    |
| `npm run cap:sync`    | Build + copia a los proyectos nativos                      |
| `npm run cap:android` | Build + abre Android Studio                                |
| `npm run cap:ios`     | Build + abre Xcode (solo en macOS)                         |

Para compilar el APK hace falta Android Studio (JDK + Android SDK); para iOS, una Mac con Xcode.
El build web no necesita nada de eso: `dist/ionic-base/browser` se publica en cualquier hosting
estático (con redirección de rutas a `index.html`).

`src/test-setup.ts` completa en las pruebas lo que jsdom no implementa (`matchMedia`).

## Arquitectura

La misma que la base moderna:

```
src/app/
├── core/       infraestructura (provideCore): HTTP, sesión, plataforma, almacenamiento, cámara, tema, diálogos, mock
├── layout/     esqueleto: menú lateral (ion-split-pane), modo oscuro, sesión
├── domain/     entidades: modelos + acceso a la API (httpResource), sin UI
├── shared/     UI genérica: controles, tabla-lista, modales, span, barra de página, tema con ámbito
└── features/   funcionalidades lazy: home, auth, showcase (pestañas con ion-tabs)
```

```
features → core, domain, shared        (nunca otra feature, nunca layout)
layout   → core, shared
domain   → core
core     → shared
shared   → nada del proyecto
```

## Qué cambia respecto a la base moderna

| Tema                 | angular-modern-base             | ionic-base                                                     |
| -------------------- | ------------------------------- | -------------------------------------------------------------- |
| Componentes visuales | daisyUI 5                       | Ionic (estilo iOS / Material según el dispositivo)             |
| Tailwind             | Todo (con preflight)            | Solo maquetación: grid, flex, gap, márgenes                    |
| Navegación           | Navbar superior                 | Menú lateral (fijo en pantallas anchas) + pestañas inferiores  |
| Modales              | `<dialog>` propio (`ModalHost`) | `ModalController` (gesto para cerrar, hoja inferior)           |
| Mensajes             | Modal de daisyUI                | `success` = toast; error/confirm = `ion-alert`                 |
| Tabla                | `<table>`                       | `ion-list`: deslizar en el teléfono, botones en pantalla ancha |
| Imagen               | `<input type="file">`           | Cámara o galería (Capacitor Camera) vía `IMAGE_PICKER`         |
| Color                | `app-input type="color"`        | `app-color` (ion-input no admite color)                        |
| Refresh token        | Cookie HttpOnly                 | Web: cookie. Nativo: en el cuerpo + Preferences                |
| Persistencia         | `localStorage`                  | `StorageService` (Capacitor Preferences)                       |
| Modo oscuro          | `data-theme` de daisyUI         | Clase `ion-palette-dark` (paleta oficial de Ionic)             |
| Paleta               | `--color-*` en OKLCH            | `--ion-color-*` (+ rgb, contrast, shade, tint)                 |

La lógica (servicios, interceptores, esquemas de Signal Forms, páginas del showcase) es la misma:
cambian las plantillas. Compara `features/showcase/pages/forms-page/forms-page.ts` en ambas bases.

## Reglas que aprendimos (y están en el historial)

Las más importantes; la lista completa está en [CONVENCIONES.md](CONVENCIONES.md).

- **Tailwind fuera de los componentes de Ionic.** Los estilos de cada componente de Ionic se
  inyectan sin capa de cascada y le ganan a `@layer utilities`: `class="hidden"` sobre
  `ion-buttons` no hace nada. Las utilidades van en `div` o componentes `app-*` (ver `styles.css`).
- **Errores de los controles.** Ionic muestra `errorText` solo con las clases `ion-touched` +
  `ion-invalid`, y en cada blur las reconstruye copiando las `ng-*`. Por eso `BaseControl` pone
  ambas (`ionClasses`).
- **Componentes que alojan un router outlet** (`App`, `MainLayout`, `ShowcaseShell`) usan
  `ChangeDetectionStrategy.Eager`, como pide la guía zoneless de Ionic.
- **Inputs con signals en modales:** `provideIonicAngular({ useSetInputAPI: true })`.
- **Pruebas:** los controladores de Ionic se registran con `provideIonicAngular()`; los eventos
  se simulan (`ionInput`, `ionChange`, `ionBlur`) y se leen las propiedades del elemento
  (`value`, `errorText`). `ion-button` mueve `aria-label` a su botón interno: busca por clase.

## Cómo se usa cada pieza

Igual que en la base moderna (HTTP con opciones por petición, sesión con signals, Signal Forms con
`[formField]`, `ModalService.open()`, `DialogService`, `ThemeService` + `[appThemeScope]`). Lo
propio de Ionic:

```ts
// Plataforma y almacenamiento
inject(PlatformService).isNative; // true dentro de la app Android/iOS
await inject(StorageService).set('clave', 'valor'); // Preferences: nativo y web

// Imagen desde cámara o galería (File | null)
const file = await inject(MediaService).pickImage({ maxWidth: 1024 });

// Editor de una tabla como hoja inferior
const table: TableConfig<Member> = { ..., editor: MemberEditor, editorOptions: { sheet: { initial: 0.75 } } };
```

```html
<!-- Cada página: ion-header + ion-content como hijos directos -->
<ion-header><app-page-toolbar title="Clientes" /></ion-header>
<ion-content class="ion-padding">
  <div class="grid grid-cols-12 gap-4">
    <app-input label="Nombre" [span]="6" [formField]="f.name" />
    <app-select label="Rol" overlay="action-sheet" [options]="roles" [formField]="f.role" />
    <app-color label="Color" [span]="6" [formField]="f.color" />
  </div>
</ion-content>
```

| Control            | Selector         | Sobre                                                 |
| ------------------ | ---------------- | ----------------------------------------------------- |
| `InputControl`     | `app-input`      | `ion-input` (+ mostrar/ocultar contraseña)            |
| `SelectControl`    | `app-select`     | `ion-select` (popover, action-sheet, alert o modal)   |
| `TextAreaControl`  | `app-text-area`  | `ion-textarea` (contador y autoGrow de Ionic)         |
| `ImageFileControl` | `app-image-file` | `IMAGE_PICKER` (cámara/galería en nativo)             |
| `ColorControl`     | `app-color`      | `<input type="color">` nativo                         |
| `DataTable`        | `app-table`      | `ion-list` + `ion-item-sliding`, modo interno/externo |

## Iniciar un proyecto a partir de esta base

1. Borrar `features/showcase`, `domain/place` y adaptar o desactivar `core/mock`.
2. Quitar la ruta `showcase` de `app.routes.ts` y su ítem en `layout/navigation/app-navigation.ts`.
3. Configurar `apiUrl` y `auth` en `src/environments/` (el backend debe aceptar `client: 'native'`
   y devolver el refresh token en el cuerpo para las apps nativas).
4. Cambiar `appId` y `appName` en `capacitor.config.ts` y ejecutar `npm run cap:sync`.
5. Crear entidades en `domain/<entidad>/` y features en `features/<feature>/<feature>.routes.ts`.

## Estudiar el historial

Cada commit agrega una sola idea, compila y pasa las pruebas. Los sprints siguen el mismo orden que
las bases web:

```bash
git log --reverse --oneline
git tag                            # sprint-0 ... sprint-7
git diff sprint-4 sprint-5
```

| Sprint | Contenido                                                                               |
| ------ | --------------------------------------------------------------------------------------- |
| 0      | CLI, Ionic 9, Tailwind solo maquetación, Capacitor 8 (Android/iOS), entornos, capas     |
| 1      | HTTP, plataforma y Preferences, auth con refresh token según plataforma, guards         |
| 2      | Modales con ModalController, DialogService (toast/alert), interceptor de respuestas     |
| 3      | Menú lateral con split-pane, paleta Ionic, modo oscuro, vista previa con ámbito         |
| 4      | Signal Forms sobre ion-input/select/textarea, cascada, cámara y selector de imagen      |
| 5      | Tabla como lista: visualización, acciones al deslizar, modo interno                     |
| 6      | Backend simulado con refresh token nativo, login, sesión en el menú                     |
| 7      | Showcase con pestañas inferiores, control de color, plataforma en Inicio, documentación |
