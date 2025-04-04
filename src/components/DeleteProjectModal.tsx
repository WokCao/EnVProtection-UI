import { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { projectsApi } from '../api/projects';
import { disableBodyScroll, enableBodyScroll } from '../utils/modal';

interface DeleteProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProjectModal({ project, onClose, onSuccess }: DeleteProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    disableBodyScroll();
    return () => enableBodyScroll();
  }, []);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await projectsApi.deleteProject(project.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Project</h2>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete the project "{project.name}"? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
} 