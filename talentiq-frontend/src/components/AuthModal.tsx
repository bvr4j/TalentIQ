"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type AuthMode = 'signin' | 'signup';

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const [isLoading, setIsLoading] = useState(false);
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowColdStartMessage(true);
      }, 4000);
    } else {
      setShowColdStartMessage(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowColdStartMessage(false);

    const form = event.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value || '';
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value || '';
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value || '';

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      let data: { access_token: string; refresh_token: string; user: { id: string; name: string; email: string } };

      if (mode === 'signup') {
        const { apiRegister } = await import('@/lib/api');
        data = await apiRegister(name, email, password);
      } else {
        const { apiLogin } = await import('@/lib/api');
        data = await apiLogin(email, password);
      }

      // Store tokens
      const { setToken } = await import('@/lib/api');
      setToken(data.access_token);
      localStorage.setItem('talentiq:refreshToken', data.refresh_token);

      // Keep existing sessionStorage flag for page auth checks
      sessionStorage.setItem('isAuthenticated', 'true');
      
      if (data.user) {
        localStorage.setItem('talentiq:user', JSON.stringify(data.user));
      }

      onClose();
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabButtonClass = (active: boolean) =>
    `flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
    }`;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4"
          onMouseDown={onClose}
        >
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#13151c]/95 shadow-2xl shadow-black/50"
            onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 px-6 py-5">
              <div className="text-2xl font-bold tracking-tight">
                Talent<span className="text-[#60A5FA]">IQ</span>
              </div>
              <p className="mt-1 text-sm text-white/50">Making Recruitment Smarter</p>
            </div>

            <div className="px-6 py-6">
              <div className="flex rounded-2xl bg-white/5 p-1">
                <button type="button" onClick={() => setMode('signin')} className={tabButtonClass(mode === 'signin')}>
                  Sign In
                </button>
                <button type="button" onClick={() => setMode('signup')} className={tabButtonClass(mode === 'signup')}>
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-white/70">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#60A5FA]/50"
                    />
                  </motion.div>
                ) : null}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/70">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#60A5FA]/50"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/70">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#60A5FA]/50"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {showColdStartMessage && !error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm text-yellow-400">
                    Waking up the server... This may take up to a minute on the free tier. Please wait!
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full rounded-xl bg-[#60A5FA] px-4 py-3 font-semibold text-[#0E0E10] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0E0E10]/30 border-t-[#0E0E10] rounded-full animate-spin" />
                      {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default AuthModal;