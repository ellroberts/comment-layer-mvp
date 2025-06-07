import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [inputPos, setInputPos] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [draggingIndex, setDraggingIndex] = useState(null);
  const containerRef = useRef(null);
  const [wasDragging, setWasDragging] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const handleMouseDown = (e, index) => {
    setDraggingIndex(index);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
  if (draggingIndex !== null && containerRef.current) {
    setWasDragging(true); // 👈 mark this as a drag event

    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    setComments((prev) => {
      const updated = [...prev];
      updated[draggingIndex] = {
        ...updated[draggingIndex],
        x: newX,
        y: newY,
      };
      return updated;
    });
  }
};

  const handleMouseUp = () => {
  if (draggingIndex !== null) {
    setDraggingIndex(null);
  }

  // 👇 wait a tick to ensure we don't immediately trigger click-to-comment
  setTimeout(() => setWasDragging(false), 0);
};

  const handleClickToComment = (e) => {
  if (wasDragging) return; // ❌ block comment popup after dragging

  if (e.target.id === "comment-layer") {
    const rect = containerRef.current.getBoundingClientRect();
    setInputPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }
};

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { ...inputPos, text: newComment }]);
      setNewComment("");
      setInputPos(null);
    }
  };

  return (
    <div
      ref={containerRef}
      id="comment-layer"
      className="w-full h-screen bg-gray-100 relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClickToComment}
    >
      <header className="bg-blue-600 text-white p-4 text-lg font-semibold">
        Comment Layer MVP
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-4 bg-white text-blue-600 px-3 py-1 rounded"
        >
          {showComments ? 'Hide' : 'Show'} Comments
        </button>
      </header>

      {showComments &&
        comments.map((c, i) => (
          <div
            key={i}
            onMouseDown={(e) => handleMouseDown(e, i)}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              cursor: "grab",
            }}
            className="z-10 bg-yellow-400 text-sm px-2 py-1 rounded shadow"
          >
            {c.text}
          </div>
        ))}

      {inputPos && (
        <div
          style={{ left: inputPos.x, top: inputPos.y }}
          className="absolute z-20 bg-white border p-2 rounded shadow"
        >
          <textarea
            className="border w-48 h-20 p-1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter comment..."
          />
          <div className="mt-1 text-right">
            <button
              onClick={handleAddComment}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}