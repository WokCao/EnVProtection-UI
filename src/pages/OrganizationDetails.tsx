import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizationsApi, OrganizationWithActiveProjectVolunteer } from '../api/organizations';
import { ProjectStatus } from '../types/project';

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<OrganizationWithActiveProjectVolunteer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganization();
  }, [id]);

  const loadOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationsApi.getOrganizationById(Number(id));
      setOrganization(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization details');
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

  if (error || !organization) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error || 'Organization not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative h-64">
          <img
            src={organization.organizationEntityModel.logo}
            alt={organization.organizationEntityModel.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">{organization.organizationEntityModel.fullName}</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {organization.activeProjects}
              </div>
              <div className="text-gray-600">Active Projects</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {organization.volunteers}
              </div>
              <div className="text-gray-600">Volunteers</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {new Date(organization.organizationEntityModel.foundedDate).getFullYear()}
              </div>
              <div className="text-gray-600">Founded</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Information</h2>
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Us</h2>
            <p className="text-gray-600">{organization.organizationEntityModel.description}</p>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
                <p className="text-gray-600">{organization.organizationEntityModel.address}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">Email: {organization.organizationEntityModel.email}</p>
                <p className="text-gray-600">Phone: {organization.organizationEntityModel.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Website */}
          {organization.organizationEntityModel.website && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Website</h2>
              <a
                href={organization.organizationEntityModel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Visit Website →
              </a>
            </div>
          )}

          {/* Projects Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {organization.project.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {project.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium truncate ${getStatusColor(project.status)}`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.briefDescription}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <span>📍 {project.location}</span>
                      <span>📅 {new Date(project.startDate).toLocaleDateString()}</span>
                      <span>👥 {project.volunteersNeeded} volunteers needed</span>
                    </div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link
              to={`/organizations/${organization.organizationEntityModel.id}/projects`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Projects
            </Link>
            <Link
              to={`/organizations/${organization.organizationEntityModel.id}/volunteers`}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Volunteers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 