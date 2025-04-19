import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrganizationStore } from '../store/organizationStore';
import { formatDistanceToNow } from 'date-fns';
import { Volunteer } from '../types/user';

export default function OrganizationVolunteers() {
    const { id } = useParams<{ id: string }>();
    const { getOrganizationVolunteers } = useOrganizationStore();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadVolunteers = async () => {
            try {
                setIsLoading(true);
                const data = await getOrganizationVolunteers(id!);
                setVolunteers(data);
                setError(null);
            } catch (err) {
                setError('Failed to load volunteers');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadVolunteers();
    }, [id, getOrganizationVolunteers]);

    const filteredVolunteers = volunteers.filter(volunteer =>
        volunteer.fullName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const paginatedVolunteers = filteredVolunteers.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Organization Volunteers</h1>
                <Link
                    to={`/organizations/${id}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                >
                    ← Back to Organization
                </Link>
            </div>

            <div className="relative mb-8 flex justify-center">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
            ) : filteredVolunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium">No volunteers found</h3>
                    <p className="mt-1 text-sm">
                        {searchTerm ? 'Try adjusting your search' : 'No volunteers have joined any projects yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedVolunteers.map((volunteer) => (
                        <div
                            key={volunteer.id}
                            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={'/panda.png'}
                                    alt={volunteer.fullName}
                                    className="h-12 w-12 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{volunteer.fullName}</h3>
                                            <p className="text-sm text-gray-500">{volunteer.email}</p>
                                            <p className="text-sm text-gray-500">Nationality: {volunteer.address}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Joined {formatDistanceToNow(new Date(volunteer.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 