import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { WorkGridLogo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#090a0f] px-4 text-slate-100 overflow-hidden">
      {/* Refined subtle ambient spotlight */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99, 102, 241, 0.22), transparent 75%)'
        }}
      />
      {/* Subtle modern dot grid */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Header Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4"><WorkGridLogo size={52} className="shadow-2xl shadow-indigo-500/30" /></div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to continue to your WorkGrid workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c]/90 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="login-email"
              label="Work Email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              {...register('email')}
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              {...register('password')}
            />

            {error && <ErrorMessage message={error} />}

            <Button
              id="login-submit"
              type="submit"
              className="w-full mt-2 font-medium tracking-wide shadow-lg shadow-indigo-600/25"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4 ml-1" />}
            >
              Sign in to WorkGrid
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
