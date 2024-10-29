'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LandingPage from '../components/LandingPage';
import DocumentList from '../components/DocumentList';
import Notes from '../components/Notes';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileIcon from '../components/ProfileIcon';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<'documents' | 'notes'>('documents');

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null); // Clear session immediately
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setSession(session);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  if (!mounted) return null;

  if (!session) {
    return <LandingPage />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen bg-white dark:bg-black text-black dark:text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <header className="bg-white dark:bg-black shadow-sm rounded-[30px] p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">DocuCollect</h1>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection('documents')}
                  className={`px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 ${
                    activeSection === 'documents'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  Documents
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection('notes')}
                  className={`px-4 py-2 rounded-[30px] text-sm font-medium transition duration-300 ${
                    activeSection === 'notes'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-gray-700'
                  }`}
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
                  onClick={handleSignOut}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </header>
          <main>
            {activeSection === 'documents' ? (
              <DocumentList />
            ) : (
              <Notes />
            )}
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
