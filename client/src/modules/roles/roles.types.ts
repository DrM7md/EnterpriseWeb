export interface RoleListItem {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  createdAtUtc: string;
}

export interface RoleDetail extends RoleListItem {
  permissionIds: number[];
  permissions: string[];
  updatedAtUtc: string | null;
}

export interface PermissionItem {
  id: number;
  code: string;
  module: string;
  description: string | null;
}

export interface ListRolesParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
