export type PermissionItem = {
  id: string;
  permission: string;
};

export type PermissionAction = {
  key: string;
  value: string;
  id: string;
};

export type SubGroup = {
  label: string;
  key: string;
  permissions: PermissionAction[];
};

export type PermissionGroup = {
  label: string;
  key: string;
  subGroups: SubGroup[];
};
