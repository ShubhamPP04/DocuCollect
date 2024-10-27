'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../../components/ThemeToggle';
import ProfileIcon from '../../components/ProfileIcon';

interface Profile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  updated_at: string;
}

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              avatar_url: null,
              full_name: null,
              updated_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      setProfile(data);
      if (data?.avatar_url) setAvatar(data.avatar_url);
      if (data?.full_name) setNewName(data.full_name);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  const updateName = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: newName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: newName } : null);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old avatar if exists
      if (avatar) {
        const oldFileName = avatar.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw updateError;

      setAvatar(publicUrl);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <p className="text-black dark:text-white">Loading...</p>
    </div>;
  }

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Add Navbar */}
        <header className="bg-white dark:bg-black shadow-sm rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">DocuCollect</h1>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700"
              >
                Documents
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700"
              >
                Notes
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <ProfileIcon />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-[30px] text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-300"
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </motion.button>
            </div>
          </div>
        </header>

        {/* Profile Settings Content */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-black dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </motion.button>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Avatar */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-black shadow-sm rounded-[30px] p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300">
                <div className="flex flex-col items-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative w-40 h-40 cursor-pointer group"
                    onClick={handleAvatarClick}
                  >
                    {avatar ? (
                      <>
                        <Image
                          src={avatar}
                          alt="Profile"
                          fill
                          className="rounded-2xl object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-2xl transition-all duration-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={uploadAvatar}
                      accept="image/*"
                      className="hidden"
                    />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to change profile picture
                    </p>
                    {uploading && (
                      <p className="text-sm text-blue-500 mt-2">Uploading...</p>
                    )}
                    {uploadError && (
                      <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - User Details */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-black shadow-sm rounded-[30px] p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 space-y-6">
                {/* Name Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  {isEditingName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-[30px] bg-white dark:bg-gray-800 text-black dark:text-white hover:border-gray-300 dark:hover:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="Enter your name"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={updateName}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-[30px] hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 transition duration-200"
                      >
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(profile?.full_name || '');
                        }}
                        className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-[30px] hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 border border-gray-200 dark:border-gray-700 transition duration-200"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-black dark:text-white">
                        {profile?.full_name || 'Not set'}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditingName(true)}
                        className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Email Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-[30px] border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                    <span className="text-black dark:text-white">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                {/* Account Created Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Member Since
                  </label>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-[30px] border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
                    <span className="text-black dark:text-white">
                      {new Date(session.user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => supabase.auth.signOut()}
                    className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[30px] hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
