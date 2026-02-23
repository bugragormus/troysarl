import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired session. Please request a new reset link.");
        // We don't redirect immediately to give user a chance to see the error,
        // but they won't be able to submit.
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setIsSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Set New Password | Troy Cars Lux SARL</title>
      </Head>
      <Toaster position="top-right" />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gradient-to-br from-premium-light to-premium-dark transition-colors duration-500">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700/50 transition-all duration-500">
            <div className="p-8 pb-4">
              {isSuccess ? (
                <div className="text-center py-6 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6 shadow-inner">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    Password Updated
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Your password has been successfully changed. You will be redirected to the login page in a moment.
                  </p>
                  <Link
                    href="/auth"
                    className="block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 text-center transition-all duration-300"
                  >
                    Go to Login Now
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                      Set New Password
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      Please enter your new secure password below
                    </p>
                  </div>

                  <form onSubmit={handleReset} className="space-y-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-95 transition-all duration-300 disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center border-t border-gray-100 dark:border-gray-700 pt-6 pb-2">
                    <Link
                      href="/auth"
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center justify-center group"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/80 px-8 py-4 flex items-center justify-center space-x-6">
               <div className="flex items-center text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                  Secure Update
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
