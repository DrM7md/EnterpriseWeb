export interface UserListItem {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  unitId: number;
  unitName: string;
  isActive: boolean;
  roles: string[];
  createdAtUtc: string;
}

export interface UserDetail extends UserListItem {
  roleIds: number[];
  updatedAtUtc: string | null;
}

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
}
