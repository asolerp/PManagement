const ADMINS = 'Administradores';
const WORKERS = 'Trabajadores';
const OWNERS = 'Propietarios';

export const parseRoleName = (role) => {
  const roleNames = {
    admin: ADMINS,
    worker: WORKERS,
    owner: OWNERS,
  };
  return roleNames[role];
};
