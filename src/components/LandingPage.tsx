'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        alert('Check your email for the password reset link!');
        setIsForgotPassword(false);
        setEmail('');
        setShowLogin(false);
        return;
      }
      
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (signUpError) throw signUpError;

        if (data?.user?.identities?.length === 0) {
          throw new Error('This email is already registered. Please sign in instead.');
        }

        setEmail('');
        setPassword('');
        setShowLogin(false);
        setIsSignUp(false);
        
        setTimeout(() => {
          alert('Please check your email for the verification link to complete signup!');
        }, 300);
        
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Auth error:', err);
      const error = err as Error;
      setError(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Smart Document Management",
      description: "Organize and access your documents intelligently with advanced sorting and filtering.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Quick Notes",
      description: "Take and organize notes effortlessly alongside your documents.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "Secure Storage",
      description: "Your documents are encrypted and safely stored in the cloud.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  const stats = [
    { number: "100+", label: "File Types" },
    { number: "50k+", label: "Active Users" },
    { number: "99.9%", label: "Uptime" }
  ];

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
                    <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
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
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-[30px] shadow-lg"
              >
                <div className="bg-black dark:bg-white w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white dark:text-black">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-4xl font-bold text-white">{stat.number}</h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
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

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your account in seconds"
              },
              {
                step: "02",
                title: "Upload Documents",
                description: "Easily upload and organize your files"
              },
              {
                step: "03",
                title: "Access Anywhere",
                description: "Access your documents from any device"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 p-8 rounded-[30px] shadow-lg relative z-10"
                >
                  <span className="text-6xl font-bold text-black/5 dark:text-white/5 absolute -top-4 -left-2">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-400">
              Join thousands of satisfied users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The best document management solution I've ever used.",
                author: "Sarah Johnson",
                role: "Product Manager"
              },
              {
                quote: "Incredibly intuitive and powerful. A game-changer for our team.",
                author: "Michael Chen",
                role: "Tech Lead"
              },
              {
                quote: "Streamlined our workflow and boosted productivity.",
                author: "Emily Davis",
                role: "Creative Director"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gray-900 dark:bg-black p-6 rounded-[30px] shadow-lg"
              >
                <svg className="w-8 h-8 text-gray-500 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 dark:text-gray-400 mb-4">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">
                      {testimonial.author}
                    </h4>
                    <p className="text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                DocuCollect
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Making document management simple and efficient.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-black dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              © {new Date().getFullYear()} DocuCollect. All rights reserved.
            </p>
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
            className="fixed inset-0 flex min-h-screen bg-black z-50"
          >
            {/* Left Section - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute inset-0 opacity-10">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="relative w-full flex flex-col justify-between p-12">
                {/* Logo and Brand */}
                <div>
                  <Link href="/" className="text-2xl font-bold text-white">
                    DocuCollect
                  </Link>
                </div>

                {/* Testimonial */}
                <div className="space-y-6">
                  <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                    &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before.&rdquo;
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="text-white font-medium">SD</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Sofia Davis</p>
                      <p className="text-gray-400 text-sm">Product Designer</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-3xl font-bold text-white">100+</p>
                    <p className="text-gray-400">Components</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">50k+</p>
                    <p className="text-gray-400">Users</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">99.9%</p>
                    <p className="text-gray-400">Uptime</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
              <div className="max-w-md w-full space-y-8">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <Link href="/" className="text-2xl font-bold text-white">
                    DocuCollect
                  </Link>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {isSignUp ? 'Create an account' : 'Welcome back'}
                    </h1>
                    <p className="mt-2 text-gray-400">
                      {isSignUp ? 'Enter your details below' : 'Enter your details to sign in'}
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-md bg-black border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        required
                      />
                    </div>
                    {!isForgotPassword && (
                      <div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full px-4 py-3 rounded-md bg-black border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                          required
                        />
                      </div>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition duration-300"
                    >
                      {loading ? 'Loading...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Sign Up' : 'Sign In'))}
                    </motion.button>
                  </form>

                  <div className="mt-6 text-center space-y-4">
                    {!isForgotPassword && (
                      <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-gray-400 hover:text-white transition duration-300"
                      >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsForgotPassword(!isForgotPassword);
                        setError(null);
                        setPassword('');
                      }}
                      className="block w-full text-sm text-gray-400 hover:text-white transition duration-300"
                    >
                      {isForgotPassword ? 'Back to login' : 'Forgot your password?'}
                    </button>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-red-500 text-sm text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <p className="mt-6 text-sm text-gray-500 text-center">
                    By clicking continue, you agree to our{' '}
                    <Link href="/terms" className="text-white hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-white hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
