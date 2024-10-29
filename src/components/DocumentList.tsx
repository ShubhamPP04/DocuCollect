import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentUpload from './DocumentUpload';
import { Document, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Document {
  id: number;
  name: string;
  file_url: string;
  created_at: string;
  user_id1: string;
  is_offline: boolean;
  file_type: string;
  is_favorite: boolean;
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id1', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched documents:', data); // Add this line

      setDocuments(data as Document[] || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  const handleDocumentAdded = (newDocument: Document) => {
    setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
  };

  const getFileType = (fileUrl: string): string => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'jpg':
      case 'jpeg':
        return 'jpg';
      case 'png':
        return 'png';
      case 'gif':
        return 'gif';
      default:
        return 'unknown';
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const fileType = getFileType(fileUrl);
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
        return (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'png':
      case 'gif':
        return (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  async function handleDeleteDocument(id: number, fileUrl: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Check if the file is stored in Supabase storage
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl('');
      
      if (fileUrl.startsWith(publicUrlData.publicUrl)) {
        // Extract the file path from the URL
        const filePath = fileUrl.replace(publicUrlData.publicUrl, '');
        const { error: deleteStorageError } = await supabase.storage
          .from('documents')
          .remove([filePath]);

        if (deleteStorageError) throw deleteStorageError;
      }

      // Delete the document record from the database
      const { error: deleteDbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id1', userData.user.id);

      if (deleteDbError) throw deleteDbError;

      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  }

  const toggleFavorite = async (docId: number) => {
    try {
      const document = documents.find(doc => doc.id === docId);
      if (!document) return;

      const { error } = await supabase
        .from('documents')
        .update({ is_favorite: !document.is_favorite })
        .eq('id', docId);

      if (error) throw error;

      // Update local state
      setDocuments(docs => docs.map(doc => 
        doc.id === docId ? { ...doc, is_favorite: !doc.is_favorite } : doc
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Filter documents based on search query, favorites, and file type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = showFavorites ? doc.is_favorite : true;
    const matchesFileType = selectedFileType ? getFileType(doc.file_url) === selectedFileType : true;
    return matchesSearch && matchesFavorites && matchesFileType;
  });

  const renderDocument = (doc: Document) => (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      className={`
        bg-white dark:bg-gray-800
        rounded-lg p-4 flex flex-col items-center justify-center relative shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      {/* Action Buttons - Top Right */}
      <div className="absolute top-2 right-2 flex space-x-2">
        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleFavorite(doc.id)}
          className="text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
        >
          {doc.is_favorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          )}
        </motion.button>

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>

      {/* Document Content */}
      <a 
        href={doc.file_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 text-center w-full"
      >
        <div className="w-full h-24 flex items-center justify-center mb-3">
          {getFileIcon(doc.file_url)}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium truncate w-full">{doc.name}</p>
          {doc.is_uploaded && (
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Uploaded Document
            </span>
          )}
        </div>
      </a>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Document Upload Section */}
      <DocumentUpload onDocumentAdded={fetchDocuments} />

      {/* Tabs and Filter Section */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFavorites(false)}
            className={`px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 ${
              !showFavorites
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700'
            }`}
          >
            All Documents
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFavorites(true)}
            className={`px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 ${
              showFavorites
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700'
            }`}
          >
            Favorites
          </motion.button>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            <span>{selectedFileType ? selectedFileType.toUpperCase() : 'Filter'}</span>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedFileType(null);
                      setIsFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    All Types
                  </button>
                  {['pdf', 'doc', 'docx', 'jpg', 'png', 'gif'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedFileType(type);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 pl-10 pr-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-[30px] focus:outline-none focus:ring-2 focus:ring-white/30 dark:focus:ring-white/20 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
        />
        <svg
          className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 8.5a6.5 6.5 0 1111.436 4.23l3.857 3.857a.75.75 0 11-1.061 1.061l-3.857-3.857A6.5 6.5 0 012 8.5z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Loading documents...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">
            {searchQuery 
              ? 'No documents found matching your search.'
              : showFavorites 
                ? 'No favorite documents yet. Star some documents to see them here!'
                : 'No documents found. Upload one to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredDocuments.map(doc => renderDocument(doc))}
        </div>
      )}
    </div>
  );
}