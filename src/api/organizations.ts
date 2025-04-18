import apiClient from './client';
import { Organization, Volunteer } from '../types/user';
import { Project } from '../types/project';
import axios from 'axios';

export interface OrganizationWithProjectCountVolunteer {
  organizationEntityModel: Organization;
  projectCount: number;
  volunteers: number;
  coordinates?: [number, number];
  country?: string;
}

export interface OrganizationWithActiveProjectVolunteer {
  organizationEntityModel: Organization;
  activeProjects: number;
  project: Project[];
  volunteers: number;
  country?: string;
}

export interface OrganizationWithProject {
  organizationEntityModel: Organization;
  project: Project[];
}

interface OrganizationWithProjectCountVolunteerResponse {
  _embedded: {
    orgWithProjectCountVolunteerList: OrganizationWithProjectCountVolunteer[];
  }
}

interface OrganizationWithActiveProjectVolunteerResponse {
  organizationEntityModel: Organization;
  projectListEntityModel: {
    _embedded: {
      projectList: Project[];
    }
  }
  activeProjects: number;
  volunteers: number;
}

interface OrganizationWithProjectResponse {
  organizationEntityModel: Organization;
  projectListEntityModel: {
    _embedded: {
      projectList: Project[];
    }
  }
}

export const organizationsApi = {
  getAllOrganizations: async (): Promise<OrganizationWithProjectCountVolunteer[]> => {
    try {
      const response = await apiClient.get<OrganizationWithProjectCountVolunteerResponse>('/organizations');
      return response.data._embedded.orgWithProjectCountVolunteerList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get organizations. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting organizations.');
    }
  },

  getOrganizationById: async (id: number): Promise<OrganizationWithActiveProjectVolunteer> => {
    try {
      const response = await apiClient.get<OrganizationWithActiveProjectVolunteerResponse>(`/organizations/${id}`);
      return {
        organizationEntityModel: response.data.organizationEntityModel,
        activeProjects: response.data.activeProjects,
        project: response.data.projectListEntityModel._embedded.projectList,
        volunteers: response.data.volunteers,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get organization with id ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization.');
    }
  },

  getOrganizationProjects: async (id: number): Promise<OrganizationWithProject> => {
    try {
      const response = await apiClient.get<OrganizationWithProjectResponse>(`/organizations/${id}/projects`);
      return {
        organizationEntityModel: response.data.organizationEntityModel,
        project: response.data.projectListEntityModel._embedded.projectList,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects for organization ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization projects.');
    }
  },

  getOrganizationVolunteers: async (organizationId: string): Promise<Volunteer[]> => {
    try {
      const response = await apiClient.get(`/organizations/${organizationId}/volunteers`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get volunteers for organization ${organizationId}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization volunteers.');
    }
  },
}; 