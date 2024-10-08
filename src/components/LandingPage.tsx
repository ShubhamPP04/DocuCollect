import { useState } from 'react';
import AuthComponent from './Auth';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, LockClosedIcon, DevicePhoneMobileIcon, FolderOpenIcon } from '@heroicons/react/24/solid';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-bold flex items-center"
        >
          <DocumentTextIcon className="w-6 h-6 mr-2" />
          DocuCollect
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogin(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-300"
        >
          Login
        </motion.button>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center">
              <FolderOpenIcon className="w-8 h-8 mr-2" />
              Organize Your Documents with Ease
            </h1>
            <p className="text-base sm:text-lg mb-4 sm:mb-6">
              DocuCollect helps you manage and access your important documents from anywhere, anytime.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              className="bg-black dark:bg-white text-white dark:text-black px-4 sm:px-6 py-2 sm:py-3 rounded-md text-sm sm:text-base font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition duration-300"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 sm:mt-16"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: 'Secure Storage', description: 'Your documents are encrypted and stored safely.', icon: <LockClosedIcon className="w-6 h-6" /> },
              { title: 'Easy Access', description: 'Access your documents from any device, anywhere.', icon: <DevicePhoneMobileIcon className="w-6 h-6" /> },
              { title: 'Smart Organization', description: 'Automatically categorize and sort your documents.', icon: <FolderOpenIcon className="w-6 h-6" /> },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md transition duration-300 ease-in-out hover:shadow-lg"
              >
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="mr-2 text-black dark:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 mt-8 sm:mt-16 py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center text-sm sm:text-base">
          <p>&copy; 2024 DocuCollect. All rights reserved.</p>
        </div>
      </footer>

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
              className="bg-white dark:bg-black p-4 sm:p-6 rounded-lg max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2" />
                  Welcome Back
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLogin(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <AuthComponent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}