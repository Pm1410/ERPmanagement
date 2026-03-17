"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) });
  const pwForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setEmailSentTo(data.email);
    setStep("otp");
    setIsLoading(false);
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setStep("password");
    setIsLoading(false);
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setStep("success");
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === "email" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot Password</h2>
            <p className="text-sm text-neutral-500 mt-2">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input 
                type="email"
                placeholder="Ex. name@example.com"
                {...emailForm.register("email")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-danger mt-1">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button 
              type="submit" disabled={isLoading}
              className="w-full h-10 rounded-md bg-primary text-white font-semibold flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
            </button>
          </form>
          
          <div className="text-center">
             <Link href="/login" className="text-sm text-neutral-500 hover:text-foreground font-medium flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Log in
             </Link>
          </div>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
             <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h2>
            <p className="text-sm text-neutral-500 mt-2">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{emailSentTo}</span>
            </p>
          </div>

          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Authentication Code</label>
              <input 
                type="text"
                placeholder="000 000"
                maxLength={6}
                {...otpForm.register("otp")}
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-xl tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary uppercase"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-sm text-danger mt-1">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>
             <button 
              type="submit" disabled={isLoading}
              className="w-full h-10 rounded-md bg-primary text-white font-semibold flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
            </button>
          </form>

          <div className="text-center text-sm">
             <span className="text-neutral-500">Didn&apos;t receive the email? </span>
             <button onClick={() => setStep("email")} className="text-primary font-semibold hover:underline">Click to resend</button>
          </div>
        </div>
      )}

      {step === "password" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <form onSubmit={pwForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input 
                type="password"
                {...pwForm.register("password")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {pwForm.formState.errors.password && (
                <p className="text-sm text-danger mt-1">{pwForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <input 
                type="password"
                {...pwForm.register("confirmPassword")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              {pwForm.formState.errors.confirmPassword && (
                <p className="text-sm text-danger mt-1">{pwForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
             <button 
              type="submit" disabled={isLoading}
              className="w-full h-10 rounded-md bg-primary text-white font-semibold flex items-center justify-center mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
            </button>
          </form>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-6 text-center animate-in zoom-in-95">
           <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Password reset</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Your password has been successfully reset. Click below to log in magically.
          </p>
           <Link 
            href="/login"
            className="w-full mt-6 h-10 rounded-md bg-primary text-white font-semibold flex items-center justify-center"
          >
            Continue to Login
          </Link>
        </div>
      )}
    </div>
  );
}
