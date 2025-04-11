import apiClient from './client';
import { Project } from '../types/project';

export const projectsApi = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  getProjectsByStatus: async (status: Project['status']): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(`/projects/status/${status}`);
    return response.data;
  },

  getProjectsByOrganization: async (organizationId: string): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(`/projects/organization/${organizationId}`);
    return response.data;
  },

  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', project);
    return response.data;
  },

  updateProject: async (id: string, project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}`, project);
    console.log(response.data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  joinProject: async (id: string): Promise<void> => {
    await apiClient.post(`/projects/${id}/join`);
  },

  getProjectsByLocation: async (location: string): Promise<Project[]> => {
    const response = await apiClient.get('/projects', {
      params: { location }
    });
    return response.data;
  },

  getProjectsByRequirements: async (requirements: string[]): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects', {
      params: { requirements: requirements.join(',') },
    });
    return response.data;
  },

  quitProject: async (projectId: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/quit`);
  },

  getVolunteerProjects: async (volunteerId: number): Promise<{projects: Project[], size: number}> => {
    const response = await apiClient.get(`/projects/volunteer/${volunteerId}`);
    return response.data;
  },
}; 