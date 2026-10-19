/**
 * Datos del backend simulado. Solo se usan con environment.mockApi = true.
 */

export interface MockUser {
  id: number;
  username: string;
  password: string;
  displayName: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 1, username: 'demo', password: 'demo123', displayName: 'Usuario Demo' },
];

/** Catálogo jerárquico de ejemplo para los selects en cascada. */
export interface MockPlace {
  id: number;
  name: string;
  children?: MockPlace[];
}

export const MOCK_PLACES: MockPlace[] = [
  {
    id: 1,
    name: 'Ecuador',
    children: [
      {
        id: 11,
        name: 'Guayas',
        children: [
          { id: 111, name: 'Guayaquil' },
          { id: 112, name: 'Durán' },
          { id: 113, name: 'Samborondón' },
        ],
      },
      {
        id: 12,
        name: 'Pichincha',
        children: [
          { id: 121, name: 'Quito' },
          { id: 122, name: 'Cayambe' },
        ],
      },
      {
        id: 13,
        name: 'Azuay',
        children: [{ id: 131, name: 'Cuenca' }],
      },
    ],
  },
  {
    id: 2,
    name: 'Perú',
    children: [
      { id: 21, name: 'Lima', children: [{ id: 211, name: 'Miraflores' }] },
      { id: 22, name: 'Cusco', children: [{ id: 221, name: 'Cusco' }] },
    ],
  },
  {
    id: 3,
    name: 'Colombia',
    children: [
      { id: 31, name: 'Antioquia', children: [{ id: 311, name: 'Medellín' }] },
      { id: 32, name: 'Cundinamarca', children: [{ id: 321, name: 'Bogotá' }] },
    ],
  },
];
