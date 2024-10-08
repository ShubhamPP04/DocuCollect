import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(data as Note[] || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (editingNote) {
        const { data, error } = await supabase
          .from('notes')
          .update({ title: newNote.title, content: newNote.content })
          .eq('id', editingNote.id)
          .select();

        if (error) throw error;

        setNotes(notes.map(note => note.id === editingNote.id ? data[0] as Note : note));
        setEditingNote(null);
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert([{ 
            title: newNote.title, 
            content: newNote.content,
            user_id: userData.user.id
          }])
          .select();

        if (error) throw error;

        setNotes([data[0] as Note, ...notes]);
      }

      setNewNote({ title: '', content: '' });
    } catch (error) {
      console.error('Error adding/updating note:', error);
      setError('Failed to add/update note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditNote(note: Note) {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
  }

  async function handleDeleteNote(id: number) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note. Please try again.');
    }
  }

  if (isLoading) {
    return <div className="text-center text-lg sm:text-xl text-black dark:text-white">Loading your notes...</div>;
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400 text-center text-lg sm:text-xl">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-black shadow-sm rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          {editingNote ? 'Edit Note' : 'Add New Note'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-800 dark:text-white"
            required
            placeholder="Note title"
          />
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black text-gray-800 dark:text-white"
            required
            placeholder="Note content"
            rows={4}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-2 rounded-md text-white font-medium transition duration-300 ${
              isSubmitting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
            }`}
          >
            {isSubmitting ? 'Saving...' : (editingNote ? 'Update Note' : 'Add Note')}
          </motion.button>
          {editingNote && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setEditingNote(null);
                setNewNote({ title: '', content: '' });
              }}
              className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition duration-300"
            >
              Cancel Edit
            </motion.button>
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-black shadow-sm rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">You haven't added any notes yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-black p-4 rounded-lg shadow-sm relative"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{note.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{note.content}</p>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Edit note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Delete note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}