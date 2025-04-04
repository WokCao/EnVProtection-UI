import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types/project';
import { projectsApi } from '../api/projects';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuthStore } from '../store/authStore';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Map click handler component
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function CreateProject() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    briefDescription: '',
    fullDescription: '',
    image: '',
    status: 'UPCOMING',
    location: '',
    latitude: 0,
    longitude: 0,
    date: '',
    time: '',
    requirements: [],
    impact: '',
    volunteersNeeded: 1,
    hostOrganization: {
      id: user.id,
      fullName: user.fullName,
    },
    volunteers: [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const requirements = e.target.value.split('\n').filter((req) => req.trim());
    setFormData((prev) => ({
      ...prev,
      requirements,
    }));
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const location = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location,
    }));

    if (location.trim()) {
      setIsGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
        );
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
          }));
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      } finally {
        setIsGeocoding(false);
      }
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Reverse geocode to get location name
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.display_name) {
          setFormData((prev) => ({
            ...prev,
            location: data.display_name,
          }));
        }
      })
      .catch((err) => console.error('Reverse geocoding error:', err));
  };

  const handleVolunteersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      volunteersNeeded: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await projectsApi.createProject(formData);
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Descriptions</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="briefDescription" className="block text-sm font-medium text-gray-700">
                Brief Description
              </label>
              <textarea
                name="briefDescription"
                id="briefDescription"
                required
                rows={3}
                value={formData.briefDescription}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                id="fullDescription"
                required
                rows={5}
                value={formData.fullDescription}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
                Impact
              </label>
              <textarea
                name="impact"
                id="impact"
                rows={3}
                value={formData.impact}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Location and Schedule */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Location and Schedule</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleLocationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter location name"
              />
              {isGeocoding && (
                <p className="mt-1 text-sm text-gray-500">Searching location...</p>
              )}
            </div>

            <div className="h-[300px] rounded-lg overflow-hidden">
              <MapContainer
                center={[formData.latitude || 0, formData.longitude || 0]}
                zoom={formData.latitude && formData.longitude ? 13 : 2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {formData.latitude && formData.longitude && (
                  <Marker position={[formData.latitude, formData.longitude]} />
                )}
                <MapClickHandler onLocationSelect={handleMapLocationSelect} />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  id="latitude"
                  required
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  id="longitude"
                  required
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  id="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Requirements</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements (one per line)
              </label>
              <textarea
                name="requirements"
                id="requirements"
                required
                rows={5}
                value={formData.requirements.join('\n')}
                onChange={handleRequirementsChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter each requirement on a new line"
              />
            </div>

            <div>
              <label htmlFor="volunteersNeeded" className="block text-sm font-medium text-gray-700">
                Number of Volunteers Needed
              </label>
              <input
                type="number"
                name="volunteersNeeded"
                id="volunteersNeeded"
                required
                min="1"
                value={formData.volunteersNeeded}
                onChange={handleVolunteersChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Enter number of volunteers needed"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Project Image</h2>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              id="image"
              required
              value={formData.image}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
} 