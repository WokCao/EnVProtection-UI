import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '../types/project';
import { projectsApi } from '../api/projects';
import { useAuthStore } from '../store/authStore';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import VolunteersModal from '../components/VolunteersModal';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const isHost = user?.id === project?.hostOrganization.id;
  const isInProject = project?.volunteers.some(volunteer => volunteer.email === user!.email);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      loadSimilarProjects();
    }
  }, [project]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectsApi.getProjectById(id!);
      setProject(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimilarProjects = async () => {
    try {
      // Get projects in the same location
      const locationProjects = await projectsApi.getProjectsByLocation(project!.location);
      // Get projects with similar requirements
      const similarRequirements = await projectsApi.getProjectsByRequirements(project!.requirements);

      // Combine and filter out the current project
      const allSimilar = [...locationProjects, ...similarRequirements]
        .filter(p => p.id !== project!.id)
        .filter((p, index, self) => self.findIndex(t => t.id === p.id) === index) // Remove duplicates
        .slice(0, 3); // Take only 3 projects

      setSimilarProjects(allSimilar);
    } catch (err) {
      console.error('Failed to load similar projects:', err);
    }
  };

  const handleJoinProject = async () => {
    try {
      setIsJoining(true);
      await projectsApi.joinProject(id!);
      loadProject();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join project');
    } finally {
      setIsJoining(false);
    }
  };

  const handleQuitProject = async () => {
    try {
      setIsJoining(true);
      await projectsApi.quitProject(id!);
      loadProject();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to quit project');
    } finally {
      setIsJoining(false);
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

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Project Header */}
      <div className="relative h-96 rounded-lg overflow-hidden mb-8">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
            <p className="text-xl">{project.briefDescription}</p>
          </div>
        </div>
      </div>

      {/* Project Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          {isHost && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Edit Project
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Project
              </button>
            </>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowVolunteersModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Volunteers ({project.volunteers.length})
          </button>
          {!isHost && user?.role === 'VOLUNTEER' && (
            <button
              onClick={isInProject ? handleQuitProject : handleJoinProject}
              disabled={isJoining || (!isInProject && project.volunteers.length >= project.volunteersNeeded) || project.status === "DONE"}
              className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 ${isInProject ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {isJoining ? 'Joining...' : isInProject ? 'Quit Project' : 'Join Project'}
            </button>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">About This Project</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{project.fullDescription}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Requirements</h2>
            <ul className="list-disc list-inside space-y-2">
              {project.requirements.map((req, index) => (
                <li key={index} className="text-gray-600">{req}</li>
              ))}
            </ul>
          </div>

          {/* Similar Projects Section */}
          {similarProjects.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Similar Projects</h2>
              <div className="space-y-4">
                {similarProjects.map((similarProject) => (
                  <Link
                    key={similarProject.id}
                    to={`/projects/${similarProject.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="flex">
                        <div className="relative w-48 h-48 flex-shrink-0">
                          <img
                            src={similarProject.image}
                            alt={similarProject.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${similarProject.status === 'DONE'
                                ? 'bg-green-100 text-green-800'
                                : similarProject.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {similarProject.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 px-6 pt-4">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                            {similarProject.name}
                          </h3>
                          <p className="mt-2 text-gray-600 line-clamp-1">
                            {similarProject.briefDescription || 'No description provided'}
                          </p>
                          <div className="mt-4 flex flex-col space-y-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className='truncate' title={similarProject.location}>{similarProject.location}</span>
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {similarProject.volunteers.length}/{similarProject.volunteersNeeded}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(similarProject.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Host Organization
                </h3>
                <p className="mt-1 text-sm text-gray-900">{project.hostOrganization.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </h3>
                <p className="mt-1 text-sm text-gray-900">{project.status.replace('_', ' ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h3>
                <p className="mt-1 text-sm text-gray-900">{project.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date & Time
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(project.date).toLocaleDateString()} at {project.time}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Volunteers
                </h3>
                <div className="mt-2 flex justify-between items-center">
                  <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((project.volunteers.length / project.volunteersNeeded) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-900">
                    {project.volunteers.length} / {project.volunteersNeeded}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-200 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Impact</h2>
            <p className="text-gray-600">{project.impact || 'No impact description provided'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={[project.latitude, project.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[project.latitude, project.longitude]} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadProject}
        />
      )}

      {showDeleteModal && (
        <DeleteProjectModal
          project={project}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => navigate('/projects')}
        />
      )}

      {showVolunteersModal && (
        <VolunteersModal
          project={project}
          onClose={() => setShowVolunteersModal(false)}
        />
      )}
    </div>
  );
} 