"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  institution: z.string().min(1, "Please select an institution"),
  role: z.enum(["STUDENT", "FACULTY", "MANAGEMENT", "PARENT"]),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      institution: "edura-main",
      role: "STUDENT",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Simulate API call POST /api/auth/login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock specific user login failures
      if (data.email === "fail@example.com") {
        throw new Error("Invalid email or password");
      }

      // Route based on role
      switch (data.role) {
        case "STUDENT":
          router.push("/student/dashboard");
          break;
        case "FACULTY":
          router.push("/faculty/dashboard");
          break;
        case "MANAGEMENT":
          router.push("/management/dashboard");
          break;
        case "PARENT":
          router.push("/parent/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
        <p className="text-sm text-neutral-500 mt-2">
          Please enter your details to access your portal
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-md text-sm">
            {errorMsg}
          </div>
        )}

        {/* Institution Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Institution
          </label>
          <select 
            {...form.register("institution")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="edura-main">Edura International Main Campus</option>
            <option value="edura-north">Edura North Branch</option>
          </select>
          {form.formState.errors.institution && (
            <p className="text-sm text-danger mt-1">{form.formState.errors.institution.message}</p>
          )}
        </div>

        {/* Role Select (Pills) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">I am a...</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(["STUDENT", "FACULTY", "MANAGEMENT", "PARENT"] as const).map((role) => (
              <label 
                key={role}
                className={`flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-md border cursor-pointer transition-all ${
                  form.watch("role") === role 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-neutral-600 border-input hover:bg-neutral-50"
                }`}
              >
                <input 
                  type="radio" 
                  value={role} 
                  {...form.register("role")}
                  className="sr-only" 
                />
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </label>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input 
            type="email"
            placeholder="name@example.com"
            {...form.register("email")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-danger mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-danger mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="rememberMe" 
            {...form.register("rememberMe")}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary" 
          />
          <label 
            htmlFor="rememberMe" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-600"
          >
            Remember me for 30 days
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-md bg-primary h-10 px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground text-neutral-500">
              Or continue with
            </span>
          </div>
        </div>

        <button 
          type="button"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-100 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors text-neutral-700"
        >
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
          Google Workspace
        </button>
      </form>
    </div>
  );
}
