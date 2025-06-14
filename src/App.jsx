// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import CommentPin from './CommentPin';
import FloatingToolbar from './components/FloatingToolbar';

export default function App() {
  const [comments, setComments] = useState([]);
  const [inputPos, setInputPos] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [wasDragging, setWasDragging] = useState(false);
  const [commentMode, setCommentMode] = useState(true);
  const [showComments, setShowComments] = useState(true);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        containerRef.current?.contains(e.target)
      ) {
        setInputPos(null);
        setNewComment('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

      supabase
        .from('commenting')
        .update({ x: newX, y: newY })
        .eq('id', comments[draggingIndex].id);
    }
  };

  const handleMouseUp = () => {
    setDraggingIndex(null);
    setWasDragging(false);
  };

  const handleCanvasClick = (e) => {
    if (!commentMode || wasDragging) {
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
      setComments(comments.filter((c) => c.id !== id));
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-white"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
  {inputPos && commentMode && (
  <div
    ref={inputRef}
    className="absolute bg-white border rounded shadow p-2 z-50"
    style={{ top: inputPos.y, left: inputPos.x }}
  >
    <input
      autoFocus
      className="border p-1"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Add a comment"
    />
    <button
      onClick={handleSubmit}
      className="ml-2 bg-blue-500 text-white px-2 rounded"
    >
      Submit
    </button>
    <button
  onClick={(e) => {
    e.stopPropagation(); // ⛔️ Stop the event from reaching the canvas
    setInputPos(null);
    setNewComment('');
  }}
  className="ml-2 text-gray-500 hover:text-black text-sm"
>
  Close
</button>
  </div>
)}

        {showComments &&
          comments.map((comment, index) => (
            <CommentPin
              key={comment.id}
              comment={comment}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <FloatingToolbar
        showComments={showComments}
        toggleShowComments={() => setShowComments((prev) => !prev)}
        commentMode={commentMode}
        toggleCommentMode={() => {
          setCommentMode((prev) => !prev);
          setInputPos(null);
        }}
      />
    </>
  );
}
