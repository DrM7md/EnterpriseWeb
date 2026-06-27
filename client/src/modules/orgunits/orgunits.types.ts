export interface OrgUnitListItem {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  isActive: boolean;
  childCount: number;
  userCount: number;
  createdAtUtc: string;
}

export interface OrgUnitDetail {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  path: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}
