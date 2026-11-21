/**
 * Identificación centralizada de cuentas administrativas de Patitas del Sur.
 * Fuente única de verdad para excluir administradores de CRM, métricas y Club Patitas.
 */
export const ADMIN_EMAILS = [
  'ialarconr.684@gmail.com',
  'alamirohuertac@hotmail.com',
  'admin@patitasdelsur.cl',
];

export const ADMIN_NAMES = [
  'ignacio alarcón',
  'ignacio alarcon',
  'alamiro huerto',
  'alamiro huerta',
];

export function isAdminName(name) {
  const normalized = String(name || '').trim().toLowerCase();
  return Boolean(normalized && ADMIN_NAMES.includes(normalized));
}

export function isAdminCustomer(customer) {
  if (!customer) return false;
  if (String(customer.role || '').toLowerCase() === 'admin') return true;
  const email = String(customer.email || '').trim().toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return true;
  const name = String(customer.full_name || customer.name || '').trim().toLowerCase();
  if (name && ADMIN_NAMES.includes(name)) return true;
  return false;
}

