import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { User, Settings, LogOut, Heart, Clock, ChevronRight, Save, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    marketing_consent: false,
    price_drop_alerts: true,
    new_arrival_alerts: true,
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        marketing_consent: profile.marketing_consent || false,
        price_drop_alerts: profile.price_drop_alerts !== false, // default true
        new_arrival_alerts: profile.new_arrival_alerts !== false, // default true
      });
    }
  }, [user, loading, profile, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          full_name: formData.full_name,
          phone: formData.phone,
          marketing_consent: formData.marketing_consent,
          price_drop_alerts: formData.price_drop_alerts,
          new_arrival_alerts: formData.new_arrival_alerts,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;
      toast.success("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Account Dashboard | Troy Cars Lux SARL</title>
      </Head>

      <div className="min-h-[80vh] bg-gray-50 dark:bg-gradient-to-br from-premium-light to-premium-dark py-12 px-4 transition-colors duration-500">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl transform rotate-3">
                <User className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {profile?.full_name || "Welcome!"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Member Since {new Date(user.created_at).getFullYear()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => signOut().then(() => router.push("/"))}
              className="flex items-center px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100 dark:border-red-500/20"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg mr-3">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button onClick={() => router.push("/favorites")} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group">
                    <div className="flex items-center">
                      <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">My Favorites</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => router.push("/appointments")} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 group-hover:text-blue-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Appointments</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Settings */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 h-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profile Settings</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Edit Info
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        disabled={!editing}
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        disabled={!editing}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4 uppercase tracking-wider">Communication Preferences</h3>
                    <div className="space-y-4">
                      <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 cursor-pointer group transition-all hover:bg-white dark:hover:bg-gray-800">
                        <input
                          type="checkbox"
                          disabled={!editing}
                          checked={formData.marketing_consent}
                          onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="ml-4">
                          <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">VIP Newsletter & Early Access</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Be the first to know about new arrivals before everyone else.</span>
                        </div>
                      </label>

                      <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 cursor-pointer group transition-all hover:bg-white dark:hover:bg-gray-800">
                        <input
                          type="checkbox"
                          disabled={!editing}
                          checked={formData.price_drop_alerts}
                          onChange={(e) => setFormData({ ...formData, price_drop_alerts: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="ml-4">
                          <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Price Drop Alerts</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Get notified when a car in your favorites has a price reduction.</span>
                        </div>
                      </label>

                      <label className="flex items-center p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 cursor-pointer group transition-all hover:bg-white dark:hover:bg-gray-800">
                        <input
                          type="checkbox"
                          disabled={!editing}
                          checked={formData.new_arrival_alerts}
                          onChange={(e) => setFormData({ ...formData, new_arrival_alerts: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="ml-4">
                          <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">New Arrival Notifications</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Stay updated when cars matching your interests are added.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Email (Login Only)</label>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="w-full p-4 bg-gray-100 dark:bg-gray-800/10 border border-gray-100 dark:border-gray-700/50 rounded-2xl text-gray-400 outline-none cursor-not-allowed"
                    />
                  </div>

                  {editing && (
                    <div className="flex items-center space-x-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </form>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Security Settings</h2>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-11 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          </div>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full pl-11 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="py-4 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                      >
                        {changingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
