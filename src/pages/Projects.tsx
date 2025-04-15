import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Project, ProjectStatus } from '../types/project';
import { projectsApi } from '../api/projects';
import { useAuthStore } from '../store/authStore';
export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isJoining, setIsJoining] = useState(false);

  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [statusFilter]);

  const handleJoinProject = async (projectId: string) => {
    try {
      setIsJoining(true);
      await projectsApi.joinProject(projectId);
      loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join project');
    } finally {
      setIsJoining(false);
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = statusFilter === 'all'
        ? await projectsApi.getAllProjects()
        : await projectsApi.getProjectsByStatus(statusFilter);
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">All Projects</option>
            <option value="UPCOMING">Waiting for Volunteers</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div>

            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="relative h-48">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 truncate">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-1">
                    {project.briefDescription || 'No description provided'}
                  </p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {project.hostOrganization.fullName}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500" title={project.location}>
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className='truncate'>{project.location}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(project.date).toLocaleDateString()} at {project.time}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {project.volunteers.length} / {project.volunteersNeeded} volunteers
                  </div>
                </div>

              </div>
            </Link>

            {user.role === 'VOLUNTEER' && (
              <div className="mt-2 mb-8">
                <button className={`w-full  text-white py-2 px-4 rounded-md transition-colors ${project.status === "IN_PROGRESS" || project.status === "UPCOMING" ? project.volunteers.some(volunteer => volunteer.id === user.id) ? "bg-green-600" : "bg-green-500 hover:bg-green-600" : "bg-gray-500 cursor-not-allowed"}`}
                onClick={() => handleJoinProject(project.id)} disabled={project.volunteers.some(volunteer => volunteer.id === user.id)}>
                  {project.status === "IN_PROGRESS" || project.status === "UPCOMING" ? isJoining ? "Joining..." : project.volunteers.some(volunteer => volunteer.id === user.id) ? "Joined" : "Join Project" : "Unavailable"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}