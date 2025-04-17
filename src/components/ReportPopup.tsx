import { useState } from 'react';

interface ReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: string[], customReason?: string) => void;
}

const reportReasons = [
  "Inappropriate content",
  "Spam or advertising",
  "Harassment or bullying",
  "Hate speech",
  "False information",
  "Other"
];

export default function ReportPopup({ isOpen, onClose, onSubmit }: ReportPopupProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customReason, setCustomReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleCheckboxChange = (reason: string) => {
    if (reason === "Other") {
      setShowCustomInput(!showCustomInput);
      if (!showCustomInput) {
        setSelectedReasons([...selectedReasons, reason]);
      } else {
        setSelectedReasons(selectedReasons.filter(r => r !== reason));
        setCustomReason('');
      }
    } else {
      if (selectedReasons.includes(reason)) {
        setSelectedReasons(selectedReasons.filter(r => r !== reason));
      } else {
        setSelectedReasons([...selectedReasons, reason]);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) return;
    onSubmit(selectedReasons, showCustomInput ? customReason : undefined);
    setSelectedReasons([]);
    setCustomReason('');
    setShowCustomInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Report Comment</h2>
        <p className="text-gray-600 mb-4">Please select the reason(s) for reporting this comment:</p>
        
        <div className="space-y-3 mb-4">
          {reportReasons.map((reason) => (
            <label key={reason} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedReasons.includes(reason)}
                onChange={() => handleCheckboxChange(reason)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{reason}</span>
            </label>
          ))}
        </div>

        {showCustomInput && (
          <div className="mb-4">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please specify the reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 max-h-[100px] overflow-y-auto"
              rows={4}
              style={{ resize: 'none' }}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedReasons.length === 0 || (showCustomInput && !customReason)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
} 