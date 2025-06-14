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

  const prototypeId = 'mobile-cpq-v1';
  const authorKey = `comment_author_${prototypeId}`;
  const [author, setAuthor] = useState(() => {
    const stored = localStorage.getItem(authorKey);
    if (stored) return stored;
    const input = prompt("What's your name?")?.trim();
    const fallback = 'Guest-' + crypto.randomUUID().slice(0, 4);
    const name = input || fallback;
    localStorage.setItem(authorKey, name);
    return name;
  });

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('commenting')
        .select('*')
        .eq('prototype', prototypeId);
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

      supabase
        .from('commenting')
        .update({ x: newX, y: newY })
        .eq('id', comments[draggingIndex].id);
    }
  };

  const handleMouseUp = () => {
  setTimeout(() => setWasDragging(false), 0); // let click handler run first
  setDraggingIndex(null);
};

  const handleCanvasClick = (e) => {
  if (!commentMode || wasDragging) {
    // Cancel comment popup if we're in drag mode or not in comment mode
    setWasDragging(false);
    return;
  }

  const rect = containerRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  setInputPos({ x, y });
};

  const handleSubmit = async () => {
    if (!inputPos || !newComment.trim()) return;

    const newEntry = {
      x: inputPos.x,
      y: inputPos.y,
      text: newComment.trim(),
      created_at: new Date().toISOString(),
      author,
      prototype: prototypeId,
    };

    const { data, error } = await supabase.from('commenting').insert([newEntry]).select();
    if (error) {
      console.error('Insert error:', error);
    } else {
      setComments((prev) => [...prev, data[0]]);
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

  const handleUpdate = async (id, newText) => {
    const { error } = await supabase
      .from('commenting')
      .update({ text: newText })
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, text: newText } : c))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        containerRef.current &&
        containerRef.current.contains(event.target)
      ) {
        setInputPos(null);
        setNewComment('');
      }
    };

    if (inputPos) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inputPos]);

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
            ref={inputRef} className="absolute bg-white border rounded shadow p-2"
            style={{ top: inputPos.y, left: inputPos.x }}
          >
            <input
              className="border p-1 min-w-[180px]"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={handleSubmit} className="ml-2 bg-blue-500 text-white px-2 rounded">
              Submit
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
              onUpdate={handleUpdate}
              currentAuthor={author}
            />
          ))}
      </div>

      <FloatingToolbar
        showComments={showComments}
        toggleShowComments={() => setShowComments((prev) => !prev)}
        commentMode={commentMode}
        toggleCommentMode={() => setCommentMode((prev) => !prev)}
      />
    </>
  );
}