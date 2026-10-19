/** Modelos locales del showcase (datos de ejemplo, sin backend). */

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Member {
  name: string;
  email: string;
  role: MemberRole;
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
};

export interface Product {
  id: number;
  name: string;
  price: number;
  active: boolean;
}
