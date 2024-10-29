'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have access to update the password
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, user might have clicked an expired link
        setError('Password reset link has expired. Please request a new one.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    checkSession();
  }, [router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Sign out the user to ensure a clean state
      await supabase.auth.signOut();
      
      alert('Password updated successfully! Please sign in with your new password.');
      router.push('/');
      
    } catch (err) {
      // Fix the TypeScript error by properly typing the error
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-lg">
        <div>
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-gray-400">Enter your new password below</p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-3 rounded-md bg-black border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition duration-300"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
} 