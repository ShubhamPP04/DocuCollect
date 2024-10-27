'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Profile {
  avatar_url: string | null;
  full_name: string | null;
}

export default function ProfileIcon() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url, full_name')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => window.location.href = '/profile'}
      className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-[30px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300"
      aria-label="Profile settings"
    >
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt="Profile"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      <span className="text-sm font-medium truncate max-w-[100px]">
        {profile?.full_name || 'Set name'}
      </span>
    </motion.button>
  );
}
