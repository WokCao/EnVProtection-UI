import { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { User } from '../types/user';
import { disableBodyScroll, enableBodyScroll } from '../utils/modal';
import { projectsApi } from '../api/projects';
import { useAuthStore } from '../store/authStore';
import defaultImage from '../../public/panda.png';

interface VolunteersModalProps {
  project: Project;
  onClose: () => void;
  onVolunteerRemoved?: (id: string) => void;
}

export default function VolunteersModal({ project, onClose, onVolunteerRemoved }: VolunteersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isHost = user?.id === project.hostOrganization.id;

  useEffect(() => {
    disableBodyScroll();
    return () => enableBodyScroll();
  }, []);

  const filteredVolunteers = project.volunteers.filter((volunteer: User) =>
    volunteer.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveVolunteer = async (volunteerId: string) => {
    if (!isHost) return;

    setIsLoading(true);
    setError(null);

    try {
      await projectsApi.removeVolunteer(project.id, volunteerId);
      if (onVolunteerRemoved) {
        onVolunteerRemoved(volunteerId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove volunteer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Project Volunteers</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Volunteers
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Search by name..."
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No volunteers found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVolunteers.map((volunteer: User) => (
                <div
                  key={volunteer.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={defaultImage}
                      alt={volunteer.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImage;
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{volunteer.fullName}</h3>
                      <p className="text-sm text-gray-500">{volunteer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500 hidden sm:block">
                      Joined {new Date(volunteer.createdAt).toLocaleDateString()}
                    </div>
                    {isHost && (
                      <button
                        onClick={() => handleRemoveVolunteer(volunteer.id)}
                        className="text-red-300 hover:text-red-500 text-sm font-medium border-2 border-red-300 hover:border-red-500 transition-all duration-300 rounded-md px-2 py-1"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
