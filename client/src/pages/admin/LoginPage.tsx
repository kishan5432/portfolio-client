import { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  UserIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle retry countdown
  useEffect(() => {
    if (retryCountdown && retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (retryCountdown === 0) {
      setRetryCountdown(null);
      setLoginError(null);
    }
  }, [retryCountdown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setRetryCountdown(null);
      setLoginError(null);
      setIsRetrying(false);
    };
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    setIsRetrying(false);
    try {
      await login(data.email, data.password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setLoginError(errorMessage);

      // Check if this is a rate limiting error
      if (errorMessage.includes('Rate limit') || errorMessage.includes('Too many authentication attempts')) {
        setIsRetrying(true);
        // Clear retrying state after a delay
        setTimeout(() => setIsRetrying(false), 5000);

        // Extract countdown from error message if available
        const countdownMatch = errorMessage.match(/(\d+)\s*(?:seconds?|minutes?)/i);
        if (countdownMatch) {
          const countdownValue = parseInt(countdownMatch[1], 10);
          const isMinutes = errorMessage.toLowerCase().includes('minutes');
          const countdownSeconds = isMinutes ? countdownValue * 60 : countdownValue;
          setRetryCountdown(countdownSeconds);
        } else {
          // Default to 15 minutes for auth rate limiting
          setRetryCountdown(15 * 60);
        }
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
          animate={shouldReduceMotion ? {} : {
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={shouldReduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LockClosedIcon className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Return to Home Button */}
          <motion.div
            className="mb-6"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              Return to Home
            </Link>
          </motion.div>

          {/* Error Alert */}
          {loginError && (
            <motion.div
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">{loginError}</p>
                  {loginError.includes('Rate limit') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      This is a temporary restriction. Please wait a moment before trying again.
                    </p>
                  )}
                  {loginError.includes('Too many authentication attempts') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Too many login attempts. Please wait 15 minutes before trying again.
                    </p>
                  )}
                  {isRetrying && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Automatically retrying...
                    </div>
                  )}
                  {retryCountdown && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-amber-600">
                      <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full"></div>
                      You can retry in {Math.floor(retryCountdown / 60)}:{(retryCountdown % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  disabled={!!retryCountdown}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
                    errors.email ? 'border-destructive' : 'border-border',
                    retryCountdown && 'opacity-50 cursor-not-allowed'
                  )}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  disabled={!!retryCountdown}
                  className={cn(
                    'w-full pl-10 pr-12 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
                    errors.password ? 'border-destructive' : 'border-border',
                    retryCountdown && 'opacity-50 cursor-not-allowed'
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!!retryCountdown}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !!retryCountdown}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : retryCountdown ? (
                'Rate Limited'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>


        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-sm text-muted-foreground mt-6"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          Protected area for authorized users only
        </motion.p>
      </motion.div>
    </div>
  );
}
