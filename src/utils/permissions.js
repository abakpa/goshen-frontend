export function hasPermission(user, required = []) {
  const permissions = user?.role?.permissions || [];
  if (permissions.includes('system:*')) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((permission) => permissions.includes(permission));
}

export function isOwnerUser(user) {
  return user?.role?.permissions?.includes('system:*');
}

export function getDefaultRoute(user) {
  const routePermissions = [
    ['/dashboard', 'dashboard:read'],
    ['/sales/pos', 'sales:create'],
    ['/inventory', 'inventory:read'],
    ['/products', 'products:read'],
    ['/sales/history', 'sales:read'],
    ['/online-sales', 'online-orders:read'],
    ['/customers', 'customers:read'],
    ['/credit-sales', 'credit-sales:read'],
    ['/expenses', 'expenses:read'],
    ['/staff', ['users:read', 'roles:read']],
    ['/reports', 'reports:read'],
    ['/settings', 'settings:read']
  ];
  return routePermissions.find(([, permission]) => hasPermission(user, permission))?.[0] || '/sales/pos';
}
