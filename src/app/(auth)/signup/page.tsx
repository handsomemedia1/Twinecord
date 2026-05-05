"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Create the user
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      // 2. Automatically log them in after successful registration
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (loginResult?.error) {
        // If auto-login fails, redirect to login page
        router.push("/login");
      } else {
        // If successful, push to the onboarding wizard
        router.push("/onboarding");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">First Name</label>
        <input 
          {...register("name")}
          type="text" 
          placeholder="e.g. Sarah" 
          className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all placeholder:text-muted-foreground/50"
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>
      
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Email</label>
        <input 
          {...register("email")}
          type="email" 
          placeholder="name@example.com" 
          className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all placeholder:text-muted-foreground/50"
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Password</label>
        <input 
          {...register("password")}
          type="password" 
          placeholder="••••••••" 
          className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-tc-primary focus:border-tc-primary outline-none transition-all placeholder:text-muted-foreground/50"
        />
        {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        <p className="text-xs text-muted-foreground/70 mt-1">Must be at least 8 characters.</p>
      </div>

      <div className="pt-2">
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>. Your IP address is recorded for security purposes.
        </p>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-tc-primary text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-tc-primary/20 hover:bg-tc-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Creating Account...
            </>
          ) : "Create Account"}
        </button>
      </div>
    </form>
  );
}
