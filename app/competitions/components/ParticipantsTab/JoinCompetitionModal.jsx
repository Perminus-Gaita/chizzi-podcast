import React, { useState, useRef } from 'react';
import axios from 'axios';

const JoinCompetitionModal = ({ isOpen, onClose, competitionId }) => {
  const [submissionLink, setSubmissionLink] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Validate if URL is from TikTok or Instagram
  const isValidPlatform = (url) => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('tiktok.com') || lowerUrl.includes('instagram.com');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate submission link
    if (!submissionLink.trim()) {
      setError('Please enter a submission link');
      return;
    }
    
    if (!isValidPlatform(submissionLink)) {
      setError('Please use a TikTok or Instagram URL only');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/competitions/join', {
        competitionId,
        submissionLink
      });
      
      onClose();
      // You might want to add success notification or redirect here
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to join competition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="bg-card w-full max-w-md p-6 rounded-lg shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-4">Join Competition</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Link to your entry video here...
            </label>
            <input
              type="url"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.tiktok.com/..."
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
            />
            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Only TikTok and Instagram URLs are accepted
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium 
                       hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white 
                       rounded-md text-sm font-medium transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Joining...' : 'Join Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinCompetitionModal;