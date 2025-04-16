import apiClient from './client';
import { Organization } from '../types/user';
import { Project } from '../types/project';
import axios from 'axios';

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
    try {
      const response = await apiClient.get<OrganizationWithFullStats[]>('/organizations');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get organizations. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting organizations.');
    }
  },

  getOrganizationById: async (id: number): Promise<OrganizationWithStats> => {
    try {
      const response = await apiClient.get<OrganizationWithStats>(`/organizations/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get organization with id ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization.');
    }
  },

  getOrganizationProjects: async (id: number): Promise<OrganizationWithProjects> => {
    try {
      const response = await apiClient.get<OrganizationWithProjects>(`/organizations/${id}/projects`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects for organization ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization projects.');
    }
  },
}; 