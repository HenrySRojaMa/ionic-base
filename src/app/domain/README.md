# domain

Entidades del negocio: **modelos + acceso a la API**, sin interfaz gráfica.
Un subdirectorio por entidad, por ejemplo:

```
domain/
└── user/
    ├── user.models.ts
    └── user.api.ts
```

- Puede depender de: `core` (ApiService y modelos base).
- No puede depender de: `layout`, `shared`, `features`.
- Si dos features necesitan los mismos datos, esos datos viven aquí.

La base no trae entidades: este directorio se llena en cada proyecto real.
