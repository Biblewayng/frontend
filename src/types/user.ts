export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  phone?: string;
  status: string;
  created_at?: string;
  createdAt?: string;
}
