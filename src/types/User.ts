export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 