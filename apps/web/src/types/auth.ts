export enum UserRole {
  ADMIN = 'ADMIN',
  LAWYER = 'LAWYER',
  PARTNER = 'PARTNER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
