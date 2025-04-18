import { create } from 'zustand';
import { organizationsApi } from '../api/organizations';
import { Volunteer } from '../types/user';

interface OrganizationStore {
  getOrganizationVolunteers: (organizationId: string) => Promise<Volunteer[]>;
}

export const useOrganizationStore = create<OrganizationStore>((set) => ({
  getOrganizationVolunteers: async (organizationId: string) => {
    try {
      const data = await organizationsApi.getOrganizationVolunteers(organizationId);
      return data;
    } catch (error) {
      console.error('Error fetching organization volunteers:', error);
      throw error;
    }
  },
})); 