import { User, Mail, Phone, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { UserProfile } from "@/hooks/useAdminData";

interface UserManagementProps {
  profiles: UserProfile[];
}

export default function UserManagement({ profiles }: UserManagementProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Directory</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage registered users and their communication preferences.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-400 shadow-sm">
            Total Users: <span className="font-bold text-blue-600 dark:text-blue-400">{profiles.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl transition-colors duration-300 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Preferences</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/20">
                        <User size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-200 transition-colors">
                          {profile.full_name || "Unnamed User"}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">ID: {profile.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {profile.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone size={14} className="mr-2 text-gray-400 dark:text-gray-500" />
                          {profile.phone}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-blue-400/80">
                        <Mail size={12} className="mr-2" />
                        Marketing: {profile.marketing_consent ? "Opted In" : "Opted Out"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-6">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 mb-1">Fiyat</div>
                        {profile.price_drop_alerts ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-red-500/50" />
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500 mb-1">Yeni</div>
                        {profile.new_arrival_alerts ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-red-500/50" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar size={14} className="mr-2 text-gray-500" />
                      {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="p-20 text-center text-gray-500 font-medium">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
