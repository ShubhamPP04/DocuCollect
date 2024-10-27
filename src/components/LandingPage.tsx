'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import AuthComponent from './Auth';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">DocuCollect</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogin(true)}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-[30px] text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-300"
          >
            Dive in
          </motion.button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl font-bold text-black dark:text-white leading-tight">
                Think, plan, and track
                <span className="block text-gray-500">all in one place</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Efficiently manage your tasks and boost productivity.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogin(true)}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-[30px] text-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-300"
              >
                Dive in
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[600px]"
          >
            {/* Notes Card */}
            <motion.div
              initial={{ rotate: -6 }}
              whileHover={{ rotate: -4 }}
              className="absolute left-0 top-20 bg-yellow-100 p-6 rounded-[30px] shadow-lg max-w-[300px]"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-500 rounded-lg p-2">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-700">Take notes to keep track of crucial details, and accomplish more tasks with ease.</p>
            </motion.div>

            {/* Tasks Card */}
            <motion.div
              initial={{ rotate: 6 }}
              whileHover={{ rotate: 4 }}
              className="absolute right-0 top-40 bg-white p-6 rounded-[30px] shadow-lg max-w-[300px]"
            >
              <h3 className="font-medium mb-4">Today's tasks</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">New ideas for campaign</span>
                    <span className="text-sm text-gray-500">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[60%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Design PPT #4</span>
                    <span className="text-sm text-gray-500">112%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Integrations Card */}
            <motion.div
              initial={{ y: 20 }}
              whileHover={{ y: 0 }}
              className="absolute bottom-20 left-20 bg-white p-6 rounded-[30px] shadow-lg"
            >
              <h3 className="font-medium mb-4">100+ Integrations</h3>
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2z"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              Everything you need in one place
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Streamline your workflow with our powerful features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-[30px] shadow-lg"
            >
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Smart Documents</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organize and access your documents intelligently with advanced sorting and filtering.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-[30px] shadow-lg"
            >
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Quick Notes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Capture ideas instantly and organize them effortlessly with our intuitive note-taking system.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-[30px] shadow-lg"
            >
              <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">Custom Workflows</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create personalized workflows that match your unique way of working.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-[30px] shadow-lg"
            >
              <h3 className="text-4xl font-bold text-black dark:text-white mb-2">100+</h3>
              <p className="text-gray-600 dark:text-gray-300">Integrations</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-[30px] shadow-lg"
            >
              <h3 className="text-4xl font-bold text-black dark:text-white mb-2">50K+</h3>
              <p className="text-gray-600 dark:text-gray-300">Active Users</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-[30px] shadow-lg"
            >
              <h3 className="text-4xl font-bold text-black dark:text-white mb-2">99.9%</h3>
              <p className="text-gray-600 dark:text-gray-300">Uptime</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black dark:bg-white text-white dark:text-black p-12 rounded-[30px] text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg mb-8 text-gray-300 dark:text-gray-700">
              Join thousands of users who are already boosting their productivity.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="bg-white dark:bg-black text-black dark:text-white px-8 py-4 rounded-[30px] text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300"
            >
              Start for free
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-black dark:text-white">DocuCollect</span>
              <span className="text-gray-500 dark:text-gray-400">© 2024</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-black p-6 rounded-[30px] max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Welcome Back
                </h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AuthComponent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
