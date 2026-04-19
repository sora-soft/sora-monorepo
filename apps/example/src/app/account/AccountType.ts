import type {AuthGroup, AuthPermission} from '../database/Auth.js';

export type AccountId = number;

export type AuthGroupId = string;

export enum PermissionResult {
  Allow = 1,
  Deny = 2,
}

export enum AccountLoginType {
  Username = 1,
  Email = 2,
}

// 默认游客 gid
export const guestGroupId: AuthGroupId = 'd36a956b-7494-480c-8bd9-66b77c89a38c';

// 注册用户
export const userGroupId: AuthGroupId = 'ebba2b40-25b3-4178-8c8a-6a6eca2def99';

// 超权用户
export const rootGroupId: AuthGroupId = 'cbe3f8c8-44bc-44ef-9a61-3bc4f6692a12';

// 默认用户组别
export const defaultGroupList: Pick<AuthGroup, 'id' | 'name' | 'protected'>[] = [
  {
    id: userGroupId,
    name: 'User',
    protected: true,
  },
  {
    id: rootGroupId,
    name: 'Root',
    protected: true,
  },
  {
    id: guestGroupId,
    name: 'Guest',
    protected: true,
  },
];

// 默认游客权限
export const defaultPermissionList: Pick<AuthPermission, 'gid' | 'name' | 'permission'>[] = [
  {
    gid: rootGroupId,
    name: 'root',
    permission: PermissionResult.Allow,
  },
];
