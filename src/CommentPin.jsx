import React, { useState } from "react";
import CommentBubble from "./CommentBubble";

export default function CommentPin({ comment, onMove, onDelete, onMouseDown }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="absolute cursor-pointer"
      style={{ top: comment.y, left: comment.x }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={onMouseDown} // ✅ enables drag
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDelete(comment.id);
      }}
    >
      <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow" />
      {isHovered && !isExpanded && (
        <div className="absolute left-6 top-0">
          <CommentBubble comment={comment} compact />
        </div>
      )}
      {isExpanded && (
        <div className="absolute left-6 top-0 z-10">
          <CommentBubble comment={comment} onClose={() => setIsExpanded(false)} />
        </div>
      )}
    </div>
  );
}
