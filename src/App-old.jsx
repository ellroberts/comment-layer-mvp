import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [comments, setComments] = useState(() => {
  try {
    const stored = localStorage.getItem("comments");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((c) => ({
          id: c.id || crypto.randomUUID(),
          x: c.x,
          y: c.y,
          text: c.text,
          createdAt: c.createdAt || new Date().toISOString(),
        }))
      : [];
  } catch {
    return [];
  }
});
  const [showComments, setShowComments] = useState(true);
  const [inputPos, setInputPos] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [draggingIndex, setDraggingIndex] = useState(null);
  const containerRef = useRef(null);
  const [wasDragging, setWasDragging] = useState(false);

  // ✅ Save to localStorage whenever comments change
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments));
  }, [comments]);

  const handleMouseDown = (e, index) => {
    setDraggingIndex(index);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (draggingIndex !== null && containerRef.current) {
      setWasDragging(true);
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
    setTimeout(() => setWasDragging(false), 0);
  };

  const handleClickToComment = (e) => {
    if (wasDragging) return;
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
      const newEntry = {
        id: crypto.randomUUID(),
        x: inputPos.x,
        y: inputPos.y,
        text: newComment,
        createdAt: new Date().toISOString(),
      };
      const updated = [...comments, newEntry];
      console.log("🧠 Saving comments:", updated);
      setComments(updated);
      setNewComment("");
      setInputPos(null);
    }
  };

  const handleDeleteComment = (id) => {
    const confirmDelete = window.confirm("Delete this comment?");
    if (confirmDelete) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(comments, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comments.json";
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          const normalized = imported.map((c) => ({
            id: c.id || crypto.randomUUID(),
            x: c.x,
            y: c.y,
            text: c.text,
            createdAt: c.createdAt || new Date().toISOString(),
          }));
          setComments(normalized);
        } else {
          alert("Invalid comment file.");
        }
      } catch {
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
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
      <header className="bg-blue-600 text-white p-4 text-lg font-semibold flex items-center justify-between">
        <div>
          Comment Layer MVP
          <button
            onClick={() => setShowComments(!showComments)}
            className="ml-4 bg-white text-blue-600 px-3 py-1 rounded"
          >
            {showComments ? "Hide" : "Show"} Comments
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-white text-blue-600 px-3 py-1 rounded"
          >
            Export
          </button>
          <label className="bg-white text-blue-600 px-3 py-1 rounded cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {showComments &&
        comments.map((c, i) => (
          <div
            key={c.id}
            onMouseDown={(e) => handleMouseDown(e, i)}
            onDoubleClick={() => handleDeleteComment(c.id)}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              cursor: "grab",
            }}
            className="z-10 bg-yellow-400 text-sm px-2 py-1 rounded shadow"
            title="Double-click to delete"
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
