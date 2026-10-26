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

## Cómo arrancar un proyecto nuevo desde esta base

Regla para los proyectos **nuevos** que se creen a partir de esta base de aquí en adelante (los que
ya existen no se tocan).

1. **Copiar la base**, quitar su remoto y seguir el historial con commits propios:

   ```bash
   git clone ionic-base <nombre-del-proyecto>
   cd <nombre-del-proyecto>
   git remote remove origin
   npm ci
   ```

2. **El proyecto nuevo no menciona la base en ninguna parte**: se renombra todo lo que contiene el
   nombre de la base o la palabra "base" referida a la plantilla, incluidos los proyectos nativos de
   Android e iOS (ver [Qué renombrar](#qué-renombrar-al-arrancar-un-proyecto)).
3. **Se borra la demostración** de la base ([Qué borrar](#qué-borrar-al-arrancar-un-proyecto)) y
   **se adapta lo propio** del proyecto ([Qué adaptar](#qué-adaptar)).
4. **Orden de los primeros commits:**
   1. `chore: rename template to <NombreProyecto>`: solo el renombrado.
   2. `refactor: remove the template demo`: solo el borrado de la demostración.
   3. Después, los commits propios del proyecto (adaptación y funcionalidades).

Al terminar, `git grep -n -i "ionic-base\|ionicbase\|ionic base\|base moderna\|base legacy\|com\.example"`
no debe encontrar nada.

### Qué renombrar al arrancar un proyecto

Archivos y claves de esta base que contienen su nombre. El `appId` se reemplaza por el
identificador real de la app (dominio invertido de la organización, por ejemplo `ec.empresa.app`):
no se puede cambiar después de publicar en las tiendas.

| Archivo                                                             | Clave / lugar                                                                        | Valor actual                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| `package.json`                                                      | `name`                                                                               | `ionic-base`                         |
| `package-lock.json`                                                 | `name` (2 veces; se regenera con `npm install`)                                      | `ionic-base`                         |
| `angular.json`                                                      | `projects` → nombre del proyecto (también define la carpeta `dist/<nombre>`)         | `ionic-base`                         |
| `angular.json`                                                      | `serve.configurations.production` / `development` → `buildTarget`                    | `ionic-base:build:...`               |
| `capacitor.config.ts`                                               | `appId`                                                                              | `com.example.ionicbase`              |
| `capacitor.config.ts`                                               | `appName`                                                                            | `Ionic Base`                         |
| `capacitor.config.ts`                                               | `webDir`                                                                             | `dist/ionic-base/browser`            |
| `scripts/check-prod-bundle.mjs`                                     | `const dir`                                                                          | `dist/ionic-base/browser`            |
| `android/app/build.gradle`                                          | `namespace` y `applicationId`                                                        | `com.example.ionicbase`              |
| `android/app/src/main/java/com/example/ionicbase/MainActivity.java` | `package` **y la ruta de carpetas** (`com/example/ionicbase` → la del nuevo `appId`) | `com.example.ionicbase`              |
| `android/app/src/main/res/values/strings.xml`                       | `app_name`, `title_activity_main`                                                    | `Ionic Base`                         |
| `android/app/src/main/res/values/strings.xml`                       | `package_name`, `custom_url_scheme`                                                  | `com.example.ionicbase`              |
| `ios/App/App.xcodeproj/project.pbxproj`                             | `PRODUCT_BUNDLE_IDENTIFIER` (Debug y Release)                                        | `com.example.ionicbase`              |
| `ios/App/App/Info.plist`                                            | `CFBundleDisplayName`                                                                | `Ionic Base`                         |
| `src/index.html`                                                    | `<title>`                                                                            | `Ionic Base`                         |
| `src/app/layout/main-layout/main-layout.ts`                         | `appName` (título del menú lateral)                                                  | `Ionic Base`                         |
| `src/app/features/home/pages/home-page/home-page.html`              | `ion-card-title` y el texto de presentación                                          | `Ionic Base` / "Plantilla base con…" |
| `README.md`                                                         | Todo el documento: título, descripción, comparación con la base moderna              | `# Ionic Base`                       |
| `CONVENCIONES.md`                                                   | Las frases que hablan de "esta base" y de `angular-modern-base`                      | —                                    |
| `src/app/domain/README.md`                                          | "La base no trae entidades…"                                                         | —                                    |
| `src/environments/environment.model.ts`                             | Comentario de `mockApi`: "Permite ejecutar la base sin servidor"                     | —                                    |
| `src/app/features/home/pages/home-page/home-page.ts`                | Comentario: "presenta la base"                                                       | —                                    |

Comentarios que comparan con las bases web (se reescriben sin esa referencia):
`core/auth/auth.guards.ts`, `core/auth/session.service.ts`,
`core/http/interceptors/dialog.interceptor.ts`, `core/theme/theme.service.ts`,
`features/auth/pages/login-page/login-page.ts`, `shared/forms/app-validators.ts` y
`shared/forms/input/input-control.ts` (todos bajo `src/app/`).

Después de renombrar: `npm run build` y `npx cap sync` para que Android e iOS tomen los cambios.

**No se renombra** lo que usa "base" en sentido técnico: `<base href="/">` (`src/index.html`),
"Estilos base de Ionic" (`src/styles.css`), el color `base` de la paleta (`shared/theme`), "URL
base" (`environment.model.ts`), "modelos base" (`domain/README.md`), `BaseControl` /
`base-control.ts` (la clase base de los controles) ni las carpetas `Base.lproj` de iOS (son la
localización por defecto de Xcode).

### Qué borrar al arrancar un proyecto

| Archivo o carpeta                                | Qué es                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/app/features/showcase/`                     | Pantallas de demostración con pestañas (formularios, cascada, tabla, diálogos, tema)                      |
| `src/app/domain/place/`                          | Entidad de ejemplo de la cascada (catálogo país > provincia > ciudad)                                     |
| `src/app/app.routes.ts`                          | La ruta `showcase` (solo esa entrada)                                                                     |
| `src/app/layout/navigation/app-navigation.ts`    | El ítem `Showcase` del menú (solo esa entrada)                                                            |
| `src/app/layout/main-layout/main-layout.ts`      | El ícono `appsOutline` (solo lo usa el ítem `Showcase`)                                                   |
| `src/app/core/mock/mock-data.ts`                 | `MOCK_PLACES` y su interfaz (el archivo se queda: también tiene `MOCK_USERS`)                             |
| `src/app/core/mock/mock-api.interceptor.ts`      | Las rutas `demo/*` (`protected`, `success`, `error`, `conflict`, `server-error`, `places`) y sus handlers |
| `src/app/core/mock/mock-api.interceptor.spec.ts` | Las pruebas de las rutas `demo/*`                                                                         |

El mock en sí (`core/mock`) se conserva mientras el proyecto lo use para desarrollar sin backend:
se le agregan las rutas del proyecto. Si no se usa, se desactiva con `mockApi: false`.

### Qué adaptar

- **API:** `apiUrl` y `auth` (`loginUrl`, `refreshUrl`, `logoutUrl`) en `src/environments/`, si
  el backend usa otras rutas. El backend debe aceptar `client: 'native'` y devolver el refresh
  token en el cuerpo para las apps nativas.
- **Formato de respuesta:** `ApiResponse` (`core/models`) y el mapeo de sesión en
  `core/auth/auth.api.ts`, si el backend responde distinto.
- **Rutas de sesión:** `AUTH_PATHS` (`core/auth/auth-paths.ts`).
- **Mock:** usuarios de prueba (`MOCK_USERS`), rutas del proyecto y los textos que busca
  `scripts/check-prod-bundle.mjs`.
- **Menú:** `APP_NAVIGATION` (`layout/navigation/app-navigation.ts`) y sus íconos en `MainLayout`.
- **Inicio y textos visibles:** `features/home` y `FORM_ERROR_MESSAGES`
  (`shared/forms/error-messages.ts`).
- **Colores:** las variables `--ion-color-*` del proyecto se agregan en `src/styles.css` (hoy usa
  la paleta por defecto de Ionic).
- **Íconos y pantalla de inicio:** `public/favicon.ico` para la web; en Android e iOS siguen siendo
  los de Capacitor y se generan para el proyecto (por ejemplo con `@capacitor/assets`).
- **Permisos nativos:** revisar los textos de cámara y fotos de `ios/App/App/Info.plist` (los ve
  el usuario al pedir el permiso).
- **Documentación:** `README.md` del proyecto y `CONVENCIONES.md` (se conserva con sus reglas, sin
  mencionar la base).
- **Dominio y funcionalidades:** entidades en `domain/<entidad>/` y features en
  `features/<feature>/<feature>.routes.ts`.

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
