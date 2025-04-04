import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { organizationsApi } from '../api/organizations';
import { Project, ProjectStatus } from '../types/project';
import { Organization } from '../types/user';

interface OrganizationWithProjects {
  organization: Organization;
  projects: Project[];
}

type SortOption = 'name' | 'status' | 'location' | 'date' | 'volunteers';

interface FilterState {
  sortBy: SortOption;
  locationFilter: string;
  nameFilter: string;
  statusFilter: ProjectStatus | 'all';
}

export default function OrganizationProjects() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organization, setOrganization] = useState<OrganizationWithProjects | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilters, setPreviousFilters] = useState<FilterState[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: (searchParams.get('sortBy') as SortOption) || 'date',
    locationFilter: searchParams.get('location') || '',
    nameFilter: searchParams.get('name') || '',
    statusFilter: (searchParams.get('status') as ProjectStatus | 'all') || 'all'
  });

  const projectsPerPage = 1;

  useEffect(() => {
    loadOrganizationProjects();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.sortBy !== 'date') params.set('sortBy', filters.sortBy);
    if (filters.locationFilter) params.set('location', filters.locationFilter);
    if (filters.nameFilter) params.set('name', filters.nameFilter);
    if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
    setSearchParams(params);
  }, [filters]);

  const loadOrganizationProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const organizationId = Number(id);
      if (isNaN(organizationId)) {
        throw new Error('Invalid organization ID');
      }
      const data = await organizationsApi.getOrganizationProjects(organizationId);
      setOrganization({
        organization: data.organization,
        projects: data.projects
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization projects');
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

  const sortProjects = (projects: Project[]) => {
    return [...projects].sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'location':
          return a.location.localeCompare(b.location);
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'volunteers':
          return b.volunteersNeeded - a.volunteersNeeded;
        default:
          return 0;
      }
    });
  };

  const filterProjects = (projects: Project[]) => {
    return projects.filter(project => {
      const matchesLocation = !filters.locationFilter ||
        project.location.toLowerCase().startsWith(filters.locationFilter.toLowerCase());
      const matchesName = !filters.nameFilter ||
        project.name.toLowerCase().startsWith(filters.nameFilter.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || project.status === filters.statusFilter;
      return matchesLocation && matchesName && matchesStatus;
    });
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setPreviousFilters([filters, ...previousFilters.slice(0, 4)]);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handlePreviousFilter = () => {
    if (previousFilters.length > 0) {
      const previousFilter = previousFilters[0];
      setFilters(previousFilter);
      setPreviousFilters(previousFilters.slice(1));
      setCurrentPage(1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(filteredAndSortedProjects.length / projectsPerPage);
    const pageNumbers = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push('...');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
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

  const filteredAndSortedProjects = sortProjects(filterProjects(organization.projects));
  const totalPages = Math.ceil(filteredAndSortedProjects.length / projectsPerPage);
  const currentProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {organization.organization.fullName} Projects
        </h1>
        <Link
          to={`/organizations/${organization.organization.id}`}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Organization
        </Link>
      </div>

      {/* Filters and Sort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="location">Location</option>
            <option value="date">Date</option>
            <option value="volunteers">Volunteers Needed</option>
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={filters.nameFilter}
            onChange={(e) => handleFilterChange({ nameFilter: e.target.value })}
            placeholder="Filter by name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={filters.statusFilter}
            onChange={(e) => handleFilterChange({ statusFilter: e.target.value as ProjectStatus | 'all' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={filters.locationFilter}
            onChange={(e) => handleFilterChange({ locationFilter: e.target.value })}
            placeholder="Filter by location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex justify-end items-center mb-8 space-x-4">
        <button
          onClick={handlePreviousFilter}
          disabled={previousFilters.length === 0}
          className={`px-4 py-2 rounded-md ${
            previousFilters.length === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Previous Filter ({previousFilters.length})
        </button>
        <button
          onClick={() => {
            handleFilterChange({
              sortBy: 'date',
              locationFilter: '',
              nameFilter: '',
              statusFilter: 'all'
            });
          }}
          className="px-4 py-2 rounded-md bg-gray-400 text-white hover:bg-red-600 transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProjects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block group h-full"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full border-2 border-green-100 hover:border-green-300">
              <div className="relative h-48">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 truncate">
                  {project.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-1 flex-grow">
                  {project.briefDescription}
                </p>
                <div className="mt-4 flex flex-col sm:flex-row md:justify-between gap-4 text-sm text-gray-500">
                  <span className="truncate sm:w-1/3">📍 {project.location}</span>
                  <span className="truncate sm:w-1/3">📅 {new Date(project.date).toLocaleDateString()}</span>
                  <span className="truncate sm:w-1/3">👥 {project.volunteersNeeded} needed</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found matching the current filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-200 text-white hover:bg-green-400'
            }`}
          >
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            )
          ))}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-200 text-white hover:bg-green-400'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 