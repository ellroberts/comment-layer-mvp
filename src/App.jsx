import React, { useState, useEffect } from 'react';

export default function App() {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [inputPos, setInputPos] = useState(null);
  const [newComment, setNewComment] = useState("");

  // 🔁 Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("comments");
    if (stored) setComments(JSON.parse(stored));
  }, []);

  // 💾 Save to localStorage
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const handleIframeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setInputPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { ...inputPos, text: newComment }]);
      setNewComment("");
      setInputPos(null);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 text-lg font-semibold">
        Comment Layer MVP
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-4 bg-white text-blue-600 px-3 py-1 rounded"
        >
          {showComments ? 'Hide' : 'Show'} Comments
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
  className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl"
  onClick={handleIframeClick}
>
  Click anywhere to add a comment
</div>

        {showComments && comments.map((c, i) => (
          <div
            key={i}
            style={{ left: c.x, top: c.y }}
            className="absolute z-10 bg-yellow-400 text-sm px-2 py-1 rounded"
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
              onChange={e => setNewComment(e.target.value)}
              placeholder="Enter comment..."
            />
            <div className="mt-1 text-right">
              <button onClick={handleAddComment} className="text-sm bg-blue-500 text-white px-2 py-1 rounded">
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
