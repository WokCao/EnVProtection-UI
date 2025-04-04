import { User } from "./user";

export type ProjectStatus = 'UPCOMING' | 'IN_PROGRESS' | 'DONE';

export interface Project {
  id: string;
  name: string;
  briefDescription: string;
  fullDescription: string;
  image: string;
  status: ProjectStatus;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  requirements: string[];
  impact?: string;
  volunteersNeeded: number;
  hostOrganization: {
    id: string;
    name: string;
  };
  volunteers: User[];
} 