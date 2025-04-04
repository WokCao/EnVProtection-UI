export type UserRole = 'VOLUNTEER' | 'ORGANIZATION';

export interface BaseUser {
  id: string;
  email: string;
  password: string; // This will be hashed in the backend
  role: UserRole;
  createdAt: Date;
  address: string;
  phoneNumber: string;
  fullName: string;
}

export interface Volunteer extends BaseUser {
  role: 'VOLUNTEER';
  age: number;
}

export interface Organization extends BaseUser {
  role: 'ORGANIZATION';
  description: string;
  logo: string;
  website?: string;
  foundedDate: Date;
}

export type User = Volunteer | Organization; 