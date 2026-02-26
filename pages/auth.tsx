import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Mail, Lock, User, Phone, CheckCircle } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    marketingConsent: false,
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Please check your email.");
        setVerificationSent(true);
        return;
      }

      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/cars");
      } else { // This 'else' block corresponds to 'register' view
        // Enforce strong password policy locally to give better UX
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error("Password must be at least 6 characters and contain a mix of uppercase, lowercase, numbers, and symbols.");
        }

        // 3. Attempt Signup
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              marketing_consent: formData.marketingConsent,
            },
          },
        });
        
        // Supabase returns a soft success (data.user but fake identities) if email exists and email confirmations are ON.
        // If email confirmations are OFF, it returns error code 'user_already_exists'.
        if (signUpError) {
            if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
                throw new Error("This email is already registered. Please log in instead.");
            }
            throw signUpError;
        }

        // If data.user exists but identities is empty, it means the user already exists! (Supabase privacy feature)
        if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
           throw new Error("This email is already registered. Please log in instead.");
        }
        
        // Profiles tablosu trigger ile oluşmazsa manuel ekleme (fail-safe)
        if (signUpData.user) {
          await supabase.from("profiles").upsert({
            id: signUpData.user.id,
            full_name: formData.fullName,
            phone: formData.phone,
            marketing_consent: formData.marketingConsent,
          });
        }

        toast.success("Account created! Please check your email for verification.");
        setVerificationSent(true);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  return (
    <>
      <Head>
        <title>{isLogin ? "Login" : "Sign Up"} | Troy Cars Lux SARL</title>
      </Head>
      
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gradient-to-br from-premium-light to-premium-dark transition-colors duration-500">
        <div className="absolute top-24 left-8 hidden lg:block">
           <Link href="/cars" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Showroom
           </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Glasmorphism Card */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 transition-all duration-500 hover:shadow-blue-500/10">
            <div className="p-8 pb-4">
              {verificationSent ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6 shadow-inner">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Verify your email
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    We've sent a verification link to <span className="font-semibold text-gray-900 dark:text-white">{formData.email}</span>. 
                    Please click the link to activate your account.
                  </p>
                  
                  <div className="space-y-4">
                     <button
                        onClick={() => {
                          setVerificationSent(false);
                          setIsLogin(true);
                        }}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all duration-300"
                      >
                        Back to Login
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Didn't receive the email? Check your spam folder or 
                        <button 
                          onClick={() => setVerificationSent(false)}
                          className="ml-1 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          try again
                        </button>
                      </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-4 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                      {view === 'login' ? "Welcome Back" : view === 'forgot-password' ? "Reset Password" : "Create Account"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      {view === 'login' 
                        ? "Enter your credentials to access your profile" 
                        : view === 'forgot-password'
                        ? "Enter your email to receive a reset link"
                        : "Join the exclusive world of Troy Cars"}
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-5">
                    {view === 'register' && (
                      <>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            name="fullName"
                            required
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (Optional)"
                            value={formData.phone}
                            onChange={handleChange}
                            className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>
                      </>
                    )}

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    {view === 'register' && (
                      <div className="flex items-start space-x-3 pt-2">
                        <div className="flex items-center h-5">
                          <input
                            id="marketingConsent"
                            name="marketingConsent"
                            type="checkbox"
                            checked={formData.marketingConsent}
                            onChange={handleChange}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded-lg focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 transition-all cursor-pointer"
                          />
                        </div>
                        <label htmlFor="marketingConsent" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                          I want to receive VIP early access to new arrivals and exclusive offers.
                        </label>
                      </div>
                    )}

                    {view !== 'forgot-password' && (
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          required
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    )}

                    {view === 'login' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        view === 'login' ? "Sign In" : view === 'forgot-password' ? "Send Reset Link" : "Register Now"
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6 pb-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      {view === 'login' 
                        ? "Don't have an account?" 
                        : view === 'forgot-password' 
                        ? "Remembered your password?" 
                        : "Already have an account?"}
                      <button
                        onClick={() => setView(view === 'login' ? 'register' : 'login')}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-bold decoration-2 hover:underline transition-all"
                      >
                        {view === 'login' ? "Register here" : "Login instead"}
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="bg-gray-50 dark:bg-gray-800/80 px-8 py-4 flex items-center justify-center space-x-6">
               <div className="flex items-center text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Secure SSL
               </div>
               <div className="flex items-center text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Certified LUX
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
