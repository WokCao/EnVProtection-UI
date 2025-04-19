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
import { useProjectActions } from '../hooks/useProjectActions';
import CommentSection from '../components/CommentSection';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>();
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [isSimilarExpanded, setIsSimilarExpanded] = useState(false);
  const navigate = useNavigate();
  const isHost = user?.id === project?.hostOrganization.id;
  const isInProject = project?.volunteers.some(volunteer => volunteer.email === user!.email);
  const { handleProjectAction, isLoading: isActionLoading, error: actionError } = useProjectActions();
  const comments = [
    {
      id: "1",
      userId: "user1",
      userName: "Sarah Johnson",
      content: "I'm really excited to participate in this cleanup! I've been to this beach before and it's beautiful. Can't wait to help keep it clean!",
      emoji: "🌊",
      date: "2024-03-20T10:30:00Z",
      likes: 12,
      isLiked: false
    },
    {
      id: "2",
      userId: "user2",
      userName: "Michael Chen",
      content: "This is a great initiative! I'll be bringing my whole family. We've been looking for ways to contribute to environmental protection.",
      emoji: "🌱",
      date: "2024-03-21T15:45:00Z",
      likes: 8,
      isLiked: true
    },
    {
      id: "3",
      userId: "user3",
      userName: "Emma Rodriguez",
      content: "I'm a marine biology student and I can't stress enough how important these cleanups are for our ecosystem. Count me in!",
      emoji: "🐠",
      date: "2024-03-22T09:15:00Z",
      likes: 15,
      isLiked: false
    },
    {
      id: "4",
      userId: "user4",
      userName: "David Wilson",
      content: "Will there be any educational sessions about marine conservation during the event?",
      emoji: "📚",
      date: "2024-03-23T11:20:00Z",
      likes: 5,
      isLiked: false
    },
    {
      id: "5",
      userId: "user5",
      userName: "Lisa Park",
      content: "I've organized similar events before. Would love to help with the coordination if needed!",
      emoji: "🤝",
      date: "2024-03-24T14:30:00Z",
      likes: 7,
      isLiked: true
    }
  ]

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
        .slice(0, 4); // Take only 3 projects

      setSimilarProjects(allSimilar);
    } catch (err) {
      console.error('Failed to load similar projects:', err);
    }
  };

  const handleJoinProject = async () => {
    if (!project) return;
    await handleProjectAction('join', project.id, () => {
      loadProject();
    });
  };

  const handleQuitProject = async () => {
    if (!project) return;
    await handleProjectAction('quit', project.id, () => {
      loadProject();
    });
  };

  const handleComment = async (content: string, emoji?: string) => {
    try {
      // Call API to add comment
      const newComment = {
        id: Date.now().toString(),
        userId: user!.id,
        userName: user!.fullName,
        content,
        emoji,
        date: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      
      setProject(prev => ({
        ...prev!,
        comments: [...(prev?.comments || []), newComment]
      }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Call API to delete comment
      setProject(prev => ({
        ...prev!,
        comments: prev?.comments?.filter(comment => comment.id !== commentId)
      }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      // Call API to like comment
      setProject(prev => ({
        ...prev!,
        comments: prev?.comments?.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked
            };
          }
          return comment;
        })
      }));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleReportComment = async (commentId: string) => {
    try {
      // Call API to report comment
      alert('Comment reported successfully');
    } catch (err) {
      console.error('Failed to report comment:', err);
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
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
          <div className="p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'DONE' ? 'bg-green-100 text-green-800' :
                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="flex items-center text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {project.volunteers.length}/{project.volunteersNeeded} Volunteers
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-4">{project.name}</h1>
            <p className="text-xl text-gray-200">{project.briefDescription}</p>
          </div>
        </div>
      </div>

      {/* Project Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-12">
        <div className="flex flex-wrap gap-4">
          {isHost && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Project
              </button>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowVolunteersModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Volunteers ({project.volunteers.length})
          </button>
          {!isHost && user?.role === 'VOLUNTEER' && (
            <button
              onClick={isInProject ? handleQuitProject : handleJoinProject}
              disabled={isActionLoading || (!isInProject && project.volunteers.length >= project.volunteersNeeded) || project.status === "DONE"}
              className={`px-6 py-3 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isInProject 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isActionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isInProject ? 'Leaving...' : 'Joining...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isInProject ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    )}
                  </svg>
                  {isInProject ? 'Quit Project' : 'Join Project'}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">About This Project</h2>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{project.fullDescription}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Requirements</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Comments Section */}
          <CommentSection
            project={project}
            onComment={handleComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
            onReport={handleReportComment}
            data={comments}
          />

          {/* Similar Projects Section */}
          {similarProjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className={`flex items-center justify-between ${isSimilarExpanded ? 'mb-4' : 'mb-0'} `}>
                <h2 className="text-2xl font-bold text-gray-900">Similar Projects</h2>
                <button
                  onClick={() => setIsSimilarExpanded(!isSimilarExpanded)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className={`w-6 h-6 transform transition-transform ${isSimilarExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {isSimilarExpanded && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {similarProjects.map((similarProject) => (
                      <Link
                        key={similarProject.id}
                        to={`/projects/${similarProject.id}`}
                        className="group"
                      >
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                          <div className="relative h-48">
                            <img
                              src={similarProject.image}
                              alt={similarProject.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                similarProject.status === 'DONE'
                                  ? 'bg-green-100 text-green-800'
                                  : similarProject.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {similarProject.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200 mb-2 truncate" title={similarProject.name}>
                              {similarProject.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {similarProject.briefDescription || 'No description provided'}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate" title={similarProject.location}>{similarProject.location}</span>
                              </span>
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {similarProject.volunteers.length}/{similarProject.volunteersNeeded}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link
                      to={`/projects?status=${project.status}&name=${project.name}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      View More Similar Projects
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Project Details</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Host Organization
                </h3>
                <p className="text-gray-900 font-medium">{project.hostOrganization.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h3>
                <p className="text-gray-900 font-medium">{project.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Date & Time
                </h3>
                <p className="text-gray-900 font-medium">
                  {new Date(project.startDate).toLocaleDateString()} at {new Date(project.startDate).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Volunteers
                </h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((project.volunteers.length / project.volunteersNeeded) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {project.volunteers.length} / {project.volunteersNeeded} volunteers joined
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Impact</h2>
            <p className="text-gray-600 leading-relaxed">{project.impact || 'No impact description provided'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Location</h2>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapContainer
                center={[project.latitude, project.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%', zIndex: 5 }}
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
          onVolunteerRemoved={(volunteerId) => {
            setProject({
              ...project,
              volunteers: project.volunteers.filter(volunteer => volunteer.id !== volunteerId)
            });
          }}
        />
      )}

      {actionError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {actionError}
        </div>
      )}
    </div>
  );
} 