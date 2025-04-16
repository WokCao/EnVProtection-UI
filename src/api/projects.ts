import apiClient from './client';
import { Project } from '../types/project';
import axios from 'axios';

interface ProjectResponse {
  _embedded: {
    projectList: Project[];
  };
  _links: {
    self: {
      href: string;
    };
  };
  _size?: number;
}

export const projectsApi = {
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ProjectResponse>('/projects');
      return response.data._embedded.projectList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get projects. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting projects.');
    }
  },

  getProjectById: async (id: string): Promise<Project> => {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get project with id ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting project.');
    }
  },

  getProjectsByStatus: async (status: Project['status']): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ProjectResponse>(`/projects/status/${status}`);
      return response.data._embedded.projectList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects by status ${status}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting projects by status.');
    }
  },

  getProjectsByOrganization: async (organizationId: string): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ProjectResponse>(`/projects/organization/${organizationId}`);
      return response.data._embedded.projectList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects for organization ${organizationId}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting organization projects.');
    }
  },

  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    try {
      const response = await apiClient.post<Project>('/projects', project);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to create project. Please try again!');
      }
      throw new Error('An unexpected error occurred during project creation.');
    }
  },

  updateProject: async (id: string, project: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.put<Project>(`/projects/${id}`, project);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to update project ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during project update.');
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to delete project ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during project deletion.');
    }
  },

  joinProject: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/projects/${id}/join`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to join project ${id}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during joining project.');
    }
  },

  getProjectsByLocation: async (location: string): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ProjectResponse>('/projects', {
        params: { location }
      });
      return response.data._embedded.projectList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects by location ${location}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting projects by location.');
    }
  },

  getProjectsByRequirements: async (requirements: string[]): Promise<Project[]> => {
    try {
      const response = await apiClient.get<ProjectResponse>('/projects', {
        params: { requirements: requirements.join(',') },
      });
      return response.data._embedded.projectList;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Failed to get projects by requirements. Please try again!');
      }
      throw new Error('An unexpected error occurred during getting projects by requirements.');
    }
  },

  quitProject: async (projectId: string): Promise<void> => {
    try {
      await apiClient.post(`/projects/${projectId}/quit`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to quit project ${projectId}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during quitting project.');
    }
  },

  getVolunteerProjects: async (volunteerId: number): Promise<{projects: Project[], size: number}> => {
    try {
      const response = await apiClient.get<ProjectResponse>(`/projects/volunteer/${volunteerId}`);
      return { projects: response.data._embedded.projectList, size: response.data._size || 0 };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to get projects for volunteer ${volunteerId}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during getting volunteer projects.');
    }
  },

  removeVolunteer: async (projectId: string, volunteerId: string): Promise<void> => {
    try {
      await apiClient.delete(`/projects/${projectId}/volunteers/${volunteerId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || `Failed to remove volunteer ${volunteerId} from project ${projectId}. Please try again!`);
      }
      throw new Error('An unexpected error occurred during removing volunteer.');
    }
  },
}; 