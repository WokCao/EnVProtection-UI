import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Organization } from '../types/user';
import { organizationsApi } from '../api/organizations';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface OrganizationWithFullStats {
  organization: Organization;
  projectCount: number;
  volunteers: number;
  coordinates?: [number, number];
  country?: string;
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<OrganizationWithFullStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const geocodeAddress = async (address: string): Promise<{ coordinates: [number, number] | null; country: string | null }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&accept-language=en`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();
      
      if (data && data[0]) {
        // Extract country from display_name (last part after the last comma)
        const displayName = data[0].display_name;
        const country = displayName.split(',').pop()?.trim() || null;
        
        return {
          coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
          country: country
        };
      }
      return { coordinates: null, country: null };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { coordinates: null, country: null };
    }
  };

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await organizationsApi.getAllOrganizations();
      
      const organizationsWithCoords = await Promise.all(
        data.map(async (org) => {
          const { coordinates, country } = await geocodeAddress(org.organization.address);
          return {
            ...org,
            coordinates: coordinates || [0, 0],
            country: country || 'Unknown'
          };
        })
      );
      
      setOrganizations(organizationsWithCoords);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const mapCenter = useMemo(() => {
    if (organizations.length === 0) return [0, 0] as LatLngExpression;
    const validCoords = organizations.filter(org => org.coordinates);
    if (validCoords.length === 0) return [0, 0] as LatLngExpression;
    
    const lat = validCoords.reduce((sum, org) => sum + (org.coordinates?.[0] || 0), 0) / validCoords.length;
    const lng = validCoords.reduce((sum, org) => sum + (org.coordinates?.[1] || 0), 0) / validCoords.length;
    return [lat, lng] as LatLngExpression;
  }, [organizations]);

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.organization.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || org.country?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Environmental Organizations
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Locations</option>
            <option value="United States">United States</option>
            <option value="Europe">Europe</option>
            <option value="Vietnam">Vietnam</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organizations List */}
        <div className="space-y-6 h-screen overflow-y-auto pb-10">
          {filteredOrganizations.map((org) => (
            <Link
              key={org.organization.id}
              to={`/organizations/${org.organization.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {org.organization.fullName}
                </h2>
                <p className="text-gray-600 mb-4">{org.organization.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 space-x-4">
                  <span className='truncate w-2/5'>📍 {org.organization.address}, {org.country}</span>
                  <span>🌟 {org.projectCount} Projects</span>
                  <span>👥 {org.volunteers} Volunteers</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Map View */}
        <div className="h-screen bg-gray-100 rounded-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            {filteredOrganizations.map((org) => (
              <Marker 
                key={org.organization.id} 
                position={org.coordinates || [0, 0]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{org.organization.fullName}</h3>
                    <p className="text-sm">{org.organization.address}, {org.country}</p>
                    <Link
                      to={`/organizations/${org.organization.id}`}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
} 