import { NavItem } from './nav-item.model';
import { visibleItems } from './navigation.service';

describe('visibleItems', () => {
  const items: NavItem[] = [
    { label: 'Inicio', path: '/' },
    { label: 'Privado', path: '/private', requiresAuth: true },
    {
      label: 'Grupo',
      children: [
        { label: 'Público', path: '/a' },
        { label: 'Admin', path: '/b', requiresAuth: true },
      ],
    },
  ];

  it('hides protected items (also nested) for anonymous users', () => {
    const result = visibleItems(items, false);
    expect(result.map((i) => i.label)).toEqual(['Inicio', 'Grupo']);
    expect(result[1].children?.map((i) => i.label)).toEqual(['Público']);
  });

  it('shows everything to authenticated users', () => {
    expect(visibleItems(items, true).length).toBe(3);
  });
});
