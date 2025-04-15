import apiClient from './client';
import { Project } from '../types/project';

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
    const response = await apiClient.get<ProjectResponse>('/projects');
    return response.data._embedded.projectList;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  getProjectsByStatus: async (status: Project['status']): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/status/${status}`);
    return response.data._embedded.projectList;
  },

  getProjectsByOrganization: async (organizationId: string): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/organization/${organizationId}`);
    return response.data._embedded.projectList;
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
    const response = await apiClient.get<ProjectResponse>('/projects', {
      params: { location }
    });
    return response.data._embedded.projectList;
  },

  getProjectsByRequirements: async (requirements: string[]): Promise<Project[]> => {
    const response = await apiClient.get<ProjectResponse>('/projects', {
      params: { requirements: requirements.join(',') },
    });
    return response.data._embedded.projectList;
  },

  quitProject: async (projectId: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/quit`);
  },

  getVolunteerProjects: async (volunteerId: number): Promise<{projects: Project[], size: number}> => {
    const response = await apiClient.get<ProjectResponse>(`/projects/volunteer/${volunteerId}`);
    return { projects: response.data._embedded.projectList, size: response.data._size || 0 };
  },

  removeVolunteer: async (projectId: string, volunteerId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/volunteers/${volunteerId}`);
  },
}; 