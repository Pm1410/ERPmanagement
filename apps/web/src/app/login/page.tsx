'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore, getPortalPath } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { label: 'Student', value: 'student', color: 'bg-green-50 border-green-200 text-green-700' },
  { label: 'Faculty', value: 'faculty', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { label: 'Management', value: 'management', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { label: 'Parent', value: 'parent', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('management');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    clearError();
    await login(values.email, values.password);
    const user = useAuthStore.getState().user;
    if (user) router.push(getPortalPath(user.role));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary-800 to-primary-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">School ERP</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Manage your institution<br />with confidence.
          </h1>
          <p className="text-primary-100 text-lg">
            A complete ERP solution for students, faculty, management, and parents.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Students', value: '10,000+' },
              { label: 'Faculty', value: '500+' },
              { label: 'Modules', value: '15+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-primary-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-primary-100">
          © {new Date().getFullYear()} School ERP. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">School ERP</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your credentials to access your portal
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-4 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={cn(
                  'rounded-lg border p-2 text-xs font-medium transition-all',
                  selectedRole === r.value ? r.color : 'border-border bg-muted/50 text-muted-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@school.edu.in"
                autoComplete="email"
                className={cn(
                  'h-10 w-full rounded-lg border bg-muted/50 px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                  errors.email && 'border-destructive focus:border-destructive focus:ring-destructive',
                )}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <a href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn(
                    'h-10 w-full rounded-lg border bg-muted/50 px-3 pr-10 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
                    errors.password && 'border-destructive',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="h-4 w-4 rounded border accent-primary" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Demo credentials</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">Admin:</span> admin@school.edu.in / Admin@1234</p>
              <p><span className="font-medium">Faculty:</span> priya.sharma@demoschool.edu.in / Faculty@2024</p>
              <p><span className="font-medium">Student:</span> arjun.mehta@student.school.in / Student@2008</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
