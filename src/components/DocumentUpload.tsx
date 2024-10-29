import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface Document {
  id: number;
  name: string;
  file_url: string;
  created_at: string;
  user_id1: string;
  is_offline: boolean;
}

interface DocumentUploadProps {
  onDocumentAdded: (document: Document) => void;
}

export default function DocumentUpload({ onDocumentAdded }: DocumentUploadProps) {
  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      let fileUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userData.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents') // Make sure this matches your bucket name
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('documents') // Make sure this matches your bucket name
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
        console.log('Uploaded file URL:', fileUrl); // Add this line

      }

      const fileType = getFileType(file.name);
      const { data, error } = await supabase
        .from('documents')
        .insert({ 
          name: name, 
          file_url: fileUrl || link,
          user_id1: userData.user.id,
          is_offline: !!file,
          is_uploaded: true,
          file_type: fileType
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Document added:', data); // Add this line

      onDocumentAdded(data as Document);
      alert('Document added successfully!');
      setLink('');
      setName('');
      setFile(null);
    } catch (error: unknown) {
      console.error('Error adding document:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert(`Error adding document: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-black shadow-md rounded-lg p-4 sm:p-6 mb-6 transition-colors duration-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black dark:text-white">Add New Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-black dark:text-gray-300 mb-1">
            Document Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border-black dark:border-gray-700 shadow-sm focus:border-black dark:focus:border-white focus:ring focus:ring-black dark:focus:ring-white focus:ring-opacity-50 bg-white dark:bg-black text-black dark:text-white text-sm sm:text-base"
            required
            placeholder="Enter document name"
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-black dark:text-gray-300 mb-1">
            Upload PDF
          </label>
          <input
            type="file"
            id="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 rounded-md border-black dark:border-gray-700 shadow-sm focus:border-black dark:focus:border-white focus:ring focus:ring-black dark:focus:ring-white focus:ring-opacity-50 bg-white dark:bg-black text-black dark:text-white text-sm sm:text-base"
          />
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium text-black dark:text-gray-300 mb-1">
            Or Enter Google Drive Link
          </label>
          <input
            type="url"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-3 py-2 rounded-md border-black dark:border-gray-700 shadow-sm focus:border-black dark:focus:border-white focus:ring focus:ring-black dark:focus:ring-white focus:ring-opacity-50 bg-white dark:bg-black text-black dark:text-white text-sm sm:text-base"
            placeholder="Paste Google Drive link"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isSubmitting
              ? 'bg-white dark:bg-gray-800 text-black cursor-not-allowed'
              : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
          } px-4 py-2 rounded-md text-sm sm:text-base font-medium transition duration-300`}
        >
          {isSubmitting ? 'Adding...' : 'Add Document'}
        </motion.button>
      </form>
    </div>
  );
}