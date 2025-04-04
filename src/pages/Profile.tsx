import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Volunteer, Organization } from '../types/user';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/16/solid';
import { Project, ProjectStatus } from '../types/project';
import { projectsApi } from '../api/projects';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/16/solid';

export default function Profile() {
  const { user } = useAuthStore();
  const [showEmail, setShowEmail] = useState(false);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (user?.role === 'VOLUNTEER') {
      loadJoinedProjects();
    }
  }, [user]);

  const loadJoinedProjects = async () => {
    try {
      setIsLoading(true);
      const { projects, size } = await projectsApi.getVolunteerProjects(parseInt(user.id));
      setJoinedProjects(projects);
      setTotalProjects(size);
    } catch (error) {
      console.error('Failed to load joined projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

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

  const renderVolunteerProfile = (user: Volunteer) => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Volunteer Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your volunteer account information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                <span>{showEmail ? user.email : '**********'}</span>
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="text-gray-500 hover:text-gray-700 ml-2"
                  aria-label={showEmail ? 'Hide email' : 'Show email'}
                >
                  {showEmail ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.fullName}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.age}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role.toLowerCase()}</dd>
            </div>
          </dl>
        </div>

        {/* Projects that the volunteer has joined */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Joined Projects</h2>
              <p className="mt-1 text-sm text-gray-500">
                Projects that you have participated in
              </p>
            </div>
            {totalProjects > 5 && (
              <Link
                to="/projects/joined"
                className="flex items-center text-green-600 hover:text-green-700"
              >
                <span>View more</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : joinedProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No projects joined yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {joinedProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
                    <div className="relative h-32">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-green-600 truncate">
                        {project.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {project.briefDescription}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Certificates Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificates</h2>
          <p className="text-gray-500 text-center py-8">No certificates available yet</p>
        </div>
      </div>
    );
  };

  const renderOrganizationProfile = (user: Organization) => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization account information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.logo}
              alt={user.fullName}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {user.fullName}
              </h3>
              <p className="text-sm text-gray-500">
                Founded {new Date(user.foundedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                <span>{showEmail ? user.email : '**********'}</span>
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="text-gray-500 hover:text-gray-700 ml-2"
                >
                  {showEmail ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.description}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.address}</dd>
            </div>
            {user.website && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-500"
                  >
                    {user.website}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {user.role === 'VOLUNTEER' && renderVolunteerProfile(user as Volunteer)}
      {user.role === 'ORGANIZATION' && renderOrganizationProfile(user as Organization)}
    </div>
  );
} 