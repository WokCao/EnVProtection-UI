import apiClient from './client';
import { Organization } from '../types/user';
import { Project } from '../types/project';

interface OrganizationWithFullStats {
  organization: Organization;
  projectCount: number;
  volunteers: number;
  coordinates?: [number, number];
  country?: string;
}

interface OrganizationWithStats {
  organization: Organization;
  activeProjects: number;
  project: Project[];
  volunteers: number;
  country?: string;
}

interface OrganizationWithProjects {
  organization: Organization;
  projects: Project[];
}

export const organizationsApi = {
  getAllOrganizations: async (): Promise<OrganizationWithFullStats[]> => {
    const response = await apiClient.get<OrganizationWithFullStats[]>('/organizations');
    return response.data;
  },
  getOrganizationById: async (id: number): Promise<OrganizationWithStats> => {
    const response = await apiClient.get<OrganizationWithStats>(`/organizations/${id}`);
    return response.data;
  },
  getOrganizationProjects: async (id: number): Promise<OrganizationWithProjects> => {
    const response = await apiClient.get<OrganizationWithProjects>(`/organizations/${id}/projects`);
    return response.data;
  },
}; 