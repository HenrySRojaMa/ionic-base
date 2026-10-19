# features

Funcionalidades de la aplicación. Cada una se carga de forma diferida (lazy)
con `loadChildren` apuntando a su archivo de rutas:

```
features/
└── <feature>/
    ├── pages/
    ├── components/
    └── <feature>.routes.ts
```

- Puede depender de: `core`, `domain`, `shared`.
- **Una feature nunca importa de otra feature.** Lo que compartan sube a
  `domain` (datos) o a `shared` (UI genérica).
