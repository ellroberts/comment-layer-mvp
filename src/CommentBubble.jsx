
import React from "react";

export default function CommentBubble({ comment, compact = false, onClose }) {
  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-lg p-3 w-64">
      <div className="text-xs text-gray-500 mb-1 flex justify-between items-center">
        <span>{comment.author || "Unknown"}</span>
        <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
      </div>
      <div className="text-sm text-gray-800">
        {comment.text || "(No comment)"}
      </div>
      {!compact && onClose && (
        <button
          className="mt-2 text-xs text-blue-600 hover:underline"
          onClick={onClose}
        >
          Close
        </button>
      )}
    </div>
  );
}
