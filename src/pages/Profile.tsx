import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Volunteer, Organization } from '../types/user';
import { EyeIcon, EyeSlashIcon, PencilIcon } from '@heroicons/react/16/solid';
import { Project, ProjectStatus } from '../types/project';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/16/solid';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [showEmail, setShowEmail] = useState(false);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState<'fullName' | 'phoneNumber' | 'address' | 'age' | 'description' | 'website' | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    age: '',
    description: '',
    website: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

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

  const handleEditClick = (field: 'fullName' | 'phoneNumber' | 'address' | 'age' | 'description' | 'website') => {
    setEditingField(field);
    setFormData(prev => ({
      ...prev,
      [field]: user[field],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      if (!editingField) return;

      const updatedUser = await usersApi.updateProfile({
        [editingField]: formData[editingField],
        age: parseInt(formData.age) || user.age,
        address: formData.address || user.address,
        phoneNumber: formData.phoneNumber || user.phoneNumber,
        fullName: formData.fullName || user.fullName,
        description: formData.description || user.description,
        website: formData.website || user.website,
      });

      setUser(updatedUser);
      setEditingField(null);
      setError('');
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      await usersApi.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      setShowChangePassword(false);
      setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
      setError('');
    } catch (error) {
      setError('Failed to change password. Please check your old password and try again.');
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
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'phoneNumber' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.phoneNumber}</span>
                    <button
                      onClick={() => handleEditClick('phoneNumber')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'fullName' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.fullName}</span>
                    <button
                      onClick={() => handleEditClick('fullName')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'age' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.age}</span>
                    <button
                      onClick={() => handleEditClick('age')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'address' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.address}</span>
                    <button
                      onClick={() => handleEditClick('address')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role.toLowerCase()}</dd>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => setShowChangePassword(true)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Change Password
              </button>
            </div>
          </dl>

          {error && (
            <div className="mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}
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
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'phoneNumber' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.phoneNumber}</span>
                    <button
                      onClick={() => handleEditClick('phoneNumber')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'description' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.description}</span>
                    <button
                      onClick={() => handleEditClick('description')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                {editingField === 'address' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      className="text-green-600 hover:text-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{user.address}</span>
                    <button
                      onClick={() => handleEditClick('address')}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </dd>
            </div>
            {user.website && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {editingField === 'website' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="border rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={handleUpdateProfile}
                        className="text-green-600 hover:text-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-500"
                      >
                        {user.website}
                      </a>
                      <button
                        onClick={() => handleEditClick('website')}
                        className="text-gray-500 hover:text-gray-700 ml-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowChangePassword(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 