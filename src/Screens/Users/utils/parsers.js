const ADMINS = 'common.admins';
const WORKERS = 'common.workers';
const OWNERS = 'common.owners';

export const parseRoleName = (role) => {
  const roleNames = {
    admin: ADMINS,
    worker: WORKERS,
    owner: OWNERS,
  };
  return roleNames[role];
};
