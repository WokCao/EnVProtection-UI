import { User } from "../store/authStore";

export type ProjectStatus = 'UPCOMING' | 'IN_PROGRESS' | 'DONE';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  emoji?: string;
  date: string;
  likes: number;
  isLiked: boolean;
}

export interface Project {
  id: string;
  name: string;
  briefDescription: string;
  fullDescription: string;
  image: string;
  status: ProjectStatus;
  startDate: string;
  expectedEndDate: string;
  location: string;
  latitude: number;
  longitude: number;
  volunteersNeeded: number;
  volunteers: User[];
  hostOrganization: User;
  requirements: string[];
  impact?: string;
  comments?: Comment[];
} 