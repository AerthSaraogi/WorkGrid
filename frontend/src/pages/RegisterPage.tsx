import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { WorkGridLogo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { UserRole } from '../types';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'DEVELOPER', label: 'Developer (Code & Tasks)' },
  { value: 'MANAGER', label: 'Manager (Projects & Assignment)' },
  { value: 'VIEWER', label: 'Viewer (Read-only)' },
  { value: 'ADMIN', label: 'Admin (Full Management)' },
];

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'DEVELOPER' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerUser(data.name, data.email, data.password, data.role as UserRole);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4"><WorkGridLogo size={52} className="shadow-2xl shadow-indigo-500/30" /></div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">Join your engineering team on WorkGrid</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#11131c]/90 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              error={errors.name?.message}
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
              {...register('name')}
            />
            <Input
              id="register-email"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="alex@company.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              {...register('email')}
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
              {...register('password')}
            />
            <Select
              id="register-role"
              label="Team Role"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />

            {error && <ErrorMessage message={error} />}

            <Button
              id="register-submit"
              type="submit"
              className="w-full mt-2 font-medium tracking-wide shadow-lg shadow-indigo-600/25"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4 ml-1" />}
            >
              Get Started
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
