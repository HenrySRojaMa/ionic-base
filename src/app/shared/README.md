# shared

UI genérica que podría copiarse a otro proyecto sin cambios: controles de
formulario, tabla, modales, directivas y utilidades.

- Todo es standalone: cada componente se importa directamente donde se usa
  (no hay `SharedModule`).
- **No puede depender de nada del proyecto** (`core`, `layout`, `domain`,
  `features`). Solo de Angular y librerías externas.
- Si un componente necesita conocer el negocio, no es genérico: va en la
  feature que lo usa.
