'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials', {
          description: 'Please check your email and password.',
        });
      } else {
        toast.success('Welcome back!');
        router.push('/tables');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            <Image
              src="/images/logo.png"
              alt="Spice Route"
              width={48}
              height={48}
              className="rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<span style="color:white;font-size:24px;font-weight:700">SR</span>';
              }}
            />
          </motion.div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1A1A1A' }}>
            Spice Route
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            Restaurant Billing System
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@spiceroute.in"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200 outline-none"
                  style={{
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAFAF8',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2D6A4F';
                    e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6B7280' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all duration-200 outline-none"
                  style={{
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAFAF8',
                    color: '#1A1A1A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2D6A4F';
                    e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              style={{
                backgroundColor: '#2D6A4F',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.target as HTMLElement).style.backgroundColor = '#245A42';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#2D6A4F';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #E5E7EB' }}>
            <p className="text-xs text-center mb-3" style={{ color: '#6B7280' }}>
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'rahul@spiceroute.in' },
                { role: 'Cashier', email: 'priya@spiceroute.in' },
                { role: 'Waiter', email: 'amit@spiceroute.in' },
              ].map((cred) => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password123');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer flex items-center justify-between"
                  style={{
                    backgroundColor: '#FAFAF8',
                    border: '1px solid #E5E7EB',
                    color: '#6B7280',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#F0F0EC';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#FAFAF8';
                  }}
                >
                  <span className="font-medium" style={{ color: '#1A1A1A' }}>{cred.role}</span>
                  <span>{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          © 2025 Spice Route. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
