# Convenciones y reglas del proyecto

Todo lo que hay que respetar al trabajar sobre esta base, reunido en un solo lugar. Cada regla
viene de una decisión o de un error real; entre paréntesis está el commit o la parte del historial
donde se explica a fondo (`git log --grep "<texto>"`). Las reglas generales son las mismas que en
`angular-modern-base`; aquí se suman las de Ionic y del móvil.

## 1. Arquitectura

- **Capas** (las hace cumplir ESLint con `no-restricted-imports`):

  ```
  features → core, domain, shared   (nunca otra feature, nunca layout)
  layout   → core, shared
  domain   → core
  core     → shared
  shared   → nada del proyecto
  ```

- Si una capa baja necesita algo de una alta, se invierte la dependencia: la capa baja declara un
  contrato (`InjectionToken`) y la alta lo registra. Ejemplo: `IMAGE_PICKER` lo declara
  `shared/forms` y lo cumple `MediaService` de `core` en `provideCore()`.
- El routing raíz **solo** carga features de forma diferida; nunca importa páginas.
- Todo lo que depende de la plataforma pasa por `core/platform` (`PlatformService`,
  `StorageService`, `MediaService`): el resto de la app no habla con Capacitor.
- Persistencia con `StorageService` (Preferences), **no** `localStorage` (no es confiable en apps
  nativas). Es asíncrono: los servicios exponen un `ready` para las pruebas.

## 2. HTTP y sesión

- Igual que la base moderna: `ApiService` con opciones por petición, interceptores auth → dialog →
  mock, access token solo en memoria, un solo refresh a la vez, `returnUrl` solo interno.
- **Refresh token según plataforma:** en web, cookie HttpOnly; en nativo viaja en el cuerpo
  (`client: 'native'`) y se guarda en Preferences (`RefreshTokenStore`). El backend debe aceptar
  ambos.
- **El mock nunca llega a producción** (`fix(core): keep the mock API out of the production
bundle`): `fileReplacements` (`mock-interceptors.ts` → `.production.ts`) y `npm run build:check`.

## 3. Formularios

- Mismas reglas que la base moderna: Signal Forms con `[formField]`, controles usables con y sin
  formulario, texto vacío `''`, el select nunca modifica el valor, cascada derivada con `computed`,
  tabla en modo interno con arreglos nuevos y copias.
- Los controles envuelven componentes de Ionic (`ion-input`, `ion-select`, `ion-textarea`):
  etiqueta en `slot="label"` (`app-control-label`), ayuda en `helperText`, error en `errorText`.
- **Errores visibles:** Ionic muestra `errorText` solo con las clases `ion-touched` + `ion-invalid`,
  y en cada blur su ValueAccessor las reconstruye copiando las `ng-*`. Por eso `BaseControl` pone
  ambas (`ionClasses`) (`fix(shared): keep Ionic error classes after the field loses focus`).
- Se escucha `ionInput` (cada tecla), no `ionChange`, para que el modelo tenga el valor al instante.
- Colores con `app-color` (`ion-input` no admite `type="color"`).

## 4. Componentes de Ionic

- Cada página enrutada tiene `<ion-header>` + `<ion-content>` como hijos directos.
- Los componentes que alojan un router outlet (`App`, `MainLayout`, `ion-tabs`) usan
  `ChangeDetectionStrategy.Eager`, con la línea `eslint-disable` que lo justifica (guía zoneless de
  Ionic).
- `provideIonicAngular({ useSetInputAPI: true })`: sin eso, Ionic pisaría los `input()` de los
  modales.
- Modales: `ModalService` (ModalController) con el contrato `ModalInteraction`; formularios cortos
  como hoja inferior (`sheet`), con Cancelar/Guardar en la barra.
- Mensajes: `success` es un toast; error/warning/info/confirm son `ion-alert`.
- **Menú lateral:** fijo en pantallas anchas con un ancho de 240-260 px (no el 28 % que trae Ionic) y
  contraíble desde su cabecera; la elección se recuerda (`fix(layout): narrow the pinned side menu
and let users collapse it`).
- Acciones de filas: deslizar en el teléfono y botones visibles en pantalla ancha.
- Presupuestos de bundle de producción: 2 MB aviso / 5 MB error, los de la plantilla oficial de
  Ionic (`fix(build): use Ionic's initial bundle budgets for production`).

## 5. Estilos y maquetación

- **Tailwind solo para maquetar** (grid, flex, gap, márgenes), sin preflight y sin daisyUI.
- **Tailwind fuera de los componentes de Ionic.** Sus estilos se inyectan sin capa de cascada y le
  ganan a `@layer utilities`: `class="hidden"` sobre `ion-buttons` o `flex` sobre
  `ion-card-content` no hacen nada. Las utilidades van en un `div` propio o en componentes `app-*`
  (`fix(shared): keep Tailwind utilities off Ionic component hosts`).
- Para personalizar un componente de Ionic, sus variables CSS (`--padding-start`, `--side-width`...)
  en los `styles` del componente.
- **Nunca concatenes clases de Tailwind**: mapas de clases literales (`shared/layout/span.ts`).
- **Grids con columnas explícitas:** `grid grid-cols-1 lg:grid-cols-3`; sin columnas, la columna
  implícita crece con su contenido y desborda en el teléfono.
- **Colores por datos:** variables `--ion-color-*` (`ThemeService.setPalette`, `[appThemeScope]`
  para vistas previas), nunca estilos inline. El modo oscuro es la clase `ion-palette-dark`.

## 6. Pruebas y verificación

- Las pruebas de una pieza van en el **mismo commit** que la pieza (Vitest + jsdom;
  `src/test-setup.ts` completa `matchMedia`).
- Componentes que inyectan controladores de Ionic: `provideIonicAngular()` en el TestBed.
- Se simulan los eventos de Ionic (`ionInput`, `ionChange`, `ionBlur` como `CustomEvent`) y se leen
  las propiedades del elemento (`value`, `errorText`), no su shadow DOM.
- `ion-button` mueve `aria-label` a su botón interno: en las pruebas se busca por clase.
- La cámara, los modales y las alertas se reemplazan por falsos (`CAMERA`, `ModalService`,
  `AlertController`, `IMAGE_PICKER`).
- Antes de cada commit: format, lint, build de desarrollo y pruebas. Antes de cerrar un sprint:
  build de producción, `npm run build:check` y **revisión visual** en escritorio (1400 px) y en
  ancho de teléfono, comprobando que no haya scroll horizontal.
- Las apps nativas se compilan con Android Studio (Android) o Xcode en una Mac (iOS). Tras agregar
  un plugin de Capacitor: `npx cap sync` y commit de los cambios nativos.

## 7. Commits

- **Un commit = una sola idea**, en orden lógico (primero lo que otros necesitan). Cada commit
  compila y pasa las pruebas por sí solo.
- Sprints de 3-6 commits con tag (`sprint-0`, `sprint-1`...), en el mismo orden que las bases web.
- Título en **inglés** con Conventional Commits (`feat|fix|refactor|test|docs|chore(ámbito): ...`);
  cuerpo en **español** explicando el porqué (en un `fix`: síntoma, causa, solución, verificación).
- Un bug en un commit anterior se corrige con un commit `fix` nuevo, nunca reescribiendo la
  historia. No se saltan verificaciones.
