import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types/project';
import ReportPopup from './ReportPopup';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    emoji?: string;
    date: string;
    likes: number;
    isLiked: boolean;
}

interface CommentSectionProps {
    project: Project;
    onComment: (content: string, emoji?: string) => void;
    onDelete: (commentId: string) => void;
    onLike: (commentId: string) => void;
    onReport: (commentId: string, reasons: string[], customReason?: string) => void;
    data: Comment[];
}

const emojis = ['😊', '👍', '❤️', '🌱', '🌍', '💪', '🙌', '👏', '🎉', '✨'];

export default function CommentSection({ project, onComment, onDelete, onLike, onReport, data }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const { user } = useAuthStore();
    const commentsRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onComment(newComment, selectedEmoji || undefined);
            setNewComment('');
            setSelectedEmoji(null);
        }
    };

    const handleReportClick = (commentId: string) => {
        setSelectedCommentId(commentId);
        setShowReportPopup(true);
    };

    const handleReportSubmit = (reasons: string[], customReason?: string) => {
        if (selectedCommentId) {
            onReport(selectedCommentId, reasons, customReason);
        }
    };

    // Sort comments by date (newest first)
    const sortedComments = [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className={`flex items-center justify-between ${isExpanded ? 'mb-4' : 'mb-0'} `}>
                <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg
                        className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <>
                    {/* Comment Input */}
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {'😊'}
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10">
                                        <div className="grid grid-cols-5 gap-2">
                                            {emojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmoji(emoji);
                                                        setShowEmojiPicker(false);
                                                        setNewComment(prev => prev + emoji);
                                                    }}
                                                    className="text-2xl hover:bg-gray-100 rounded p-1"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Post
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div 
                        ref={commentsRef}
                        className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                        {sortedComments.map((comment) => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                        {comment.emoji || '👤'}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium text-gray-900">{comment.userName}</div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(comment.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="mt-1 text-gray-600">{comment.content}</p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <button
                                                onClick={() => onLike(comment.id)}
                                                className={`flex items-center gap-1 transition-colors ${
                                                    comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                                }`}
                                            >
                                                <svg 
                                                    className="w-5 h-5" 
                                                    fill={comment.isLiked ? "currentColor" : "none"} 
                                                    viewBox="0 0 24 24" 
                                                    stroke="currentColor"
                                                >
                                                    <path 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                        strokeWidth={2} 
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                                    />
                                                </svg>
                                                <span>{comment.likes}</span>
                                            </button>
                                            <button
                                                onClick={() => handleReportClick(comment.id)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </button>
                                            {user?.id === comment.userId && (
                                                <button
                                                    onClick={() => onDelete(comment.id)}
                                                    className="text-gray-500 hover:text-red-600"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <ReportPopup
                isOpen={showReportPopup}
                onClose={() => {
                    setShowReportPopup(false);
                    setSelectedCommentId(null);
                }}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
} 