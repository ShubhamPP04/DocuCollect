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
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
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
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
        return (
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
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

  const renderDocument = (doc: Document) => {
    return (
      <motion.div
        key={doc.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center justify-center relative"
      >
        <a 
          href={doc.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 text-center w-full"
        >
          <div className="w-full h-20 sm:h-24 flex items-center justify-center mb-2">
            {getFileIcon(doc.file_url)}
          </div>
          <p className="text-xs sm:text-sm font-medium truncate w-full">{doc.name}</p>
        </a>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
          className="absolute top-1 right-1 text-black dark:text-white hover:text-red-500 dark:hover:text-red-400"
          aria-label="Delete document"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </motion.div>
    );
  };

  if (isLoading) {
    return <div className="text-center text-lg sm:text-xl text-black dark:text-white">Loading your documents...</div>;
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400 text-center text-lg sm:text-xl">{error}</div>;
  }

  const offlineDocuments = documents.filter(doc => doc.is_offline);
  const onlineDocuments = documents.filter(doc => !doc.is_offline);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <DocumentUpload onDocumentAdded={handleDocumentAdded} />
      <div className="bg-white dark:bg-black shadow-md rounded-lg p-4 sm:p-6 transition-colors duration-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black dark:text-white">Your Document Collection</h2>
        
        {documents.length === 0 ? (
          <p className="text-black dark:text-gray-300 text-sm sm:text-base">Your collection is empty. Add some documents!</p>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-white">Offline Documents</h3>
              {offlineDocuments.length === 0 ? (
                <p className="text-black dark:text-gray-300 text-sm sm:text-base">No offline documents yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {offlineDocuments.map(renderDocument)}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black dark:text-white">Online Documents</h3>
              {onlineDocuments.length === 0 ? (
                <p className="text-black dark:text-gray-300 text-sm sm:text-base">No online documents yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {onlineDocuments.map(renderDocument)}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}