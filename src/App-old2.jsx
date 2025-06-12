
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

export default function App() {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(true);
  const [inputPos, setInputPos] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [draggingIndex, setDraggingIndex] = useState(null);
  const containerRef = useRef(null);
  const [wasDragging, setWasDragging] = useState(false);

  // Load comments from Supabase
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase.from('commenting').select('*');
      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data);
      }
    };
    fetchComments();
  }, []);

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

      const updatedComment = { ...comments[draggingIndex], x: newX, y: newY };
      setComments((prev) => {
        const updated = [...prev];
        updated[draggingIndex] = updatedComment;
        return updated;
      });

      supabase.from('commenting').update({ x: newX, y: newY }).eq('id', comments[draggingIndex].id);
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setWasDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setInputPos({ x, y });
  };

  const handleSubmit = async () => {
    const newEntry = {
      x: inputPos.x,
      y: inputPos.y,
      text: newComment,
      created_at: new Date().toISOString(),
      author: 'Elliot Roberts',
    };

    const { data, error } = await supabase.from('commenting').insert([newEntry]).select();
    if (error) {
      console.error('Insert error:', error);
    } else {
      setComments([...comments, data[0]]);
      setInputPos(null);
      setNewComment('');
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('commenting').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
    } else {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-white"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {inputPos && (
        <div className="absolute bg-white border rounded shadow p-2" style={{ top: inputPos.y, left: inputPos.x }}>
          <input
            className="border p-1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button onClick={handleSubmit} className="ml-2 bg-blue-500 text-white px-2 rounded">
            Submit
          </button>
        </div>
      )}

      {comments.map((comment, index) => (
        <div
          key={comment.id}
          className="absolute cursor-move"
          style={{ top: comment.y, left: comment.x }}
          onMouseDown={(e) => handleMouseDown(e, index)}
          onDoubleClick={() => handleDelete(comment.id)}
        >
          📍
        </div>
      ))}
    </div>
  );
}
