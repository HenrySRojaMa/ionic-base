# core

Infraestructura única de la aplicación (sin pantallas propias): HTTP, sesión,
interceptores, guards, tema y diálogos.

- Sus providers se registran **una sola vez** con `provideCore()` en
  `app.config.ts`. Los servicios usan `@Service()` (singletons globales).
- Puede depender de: `shared` (solo UI genérica).
- No puede depender de: `layout`, `domain`, `features`.
