export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}
