import React from 'react';

export default function FloatingToolbar({
  showComments,
  toggleShowComments,
  commentMode,
  toggleCommentMode,
}) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md border border-gray-300 rounded-full px-4 py-2 flex items-center gap-6 z-50">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Show Comments</span>
        <button
          onClick={toggleShowComments}
          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${
            showComments ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
              showComments ? 'translate-x-5' : 'translate-x-0'
            }`}
          ></div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Comment Mode</span>
        <button
          onClick={toggleCommentMode}
          className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${
            commentMode ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
              commentMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          ></div>
        </button>
      </div>
    </div>
  );
}
