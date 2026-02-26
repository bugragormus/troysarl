import { useState, useEffect } from "react";
import { User, Eye, Heart, Calendar, ChevronDown, ChevronUp, ExternalLink, Mail, Hash } from "lucide-react";
import toast from "react-hot-toast";

interface Interaction {
  car_id: string;
  brand: string;
  model: string;
  photo?: string;
  count?: number;
  year?: string;
  price?: number;
}

interface UserLead {
    id: string;
    full_name: string;
    email: string;
    joined_at: string;
    views: Interaction[];
    favorites: Interaction[];
    total_activity: number;
}

export default function LeadInsights() {
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin-lead-insights");
      if (!res.ok) throw new Error("Failed to fetch lead insights");
      const data = await res.json();
      setLeads(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Insights</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Analyze user behavior, preferences, and engagement per car.</p>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <div 
            key={lead.id}
            className={`bg-white/40 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300 shadow-xl ${expandedUser === lead.id ? 'ring-2 ring-blue-500/50' : 'hover:border-gray-300 dark:hover:border-gray-700'}`}
          >
            {/* Header / Summary */}
            <div 
              onClick={() => setExpandedUser(expandedUser === lead.id ? null : lead.id)}
              className="px-8 py-6 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/20">
                  <User size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{lead.full_name}</h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center"><Mail size={14} className="mr-1" /> {lead.email}</span>
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {new Date(lead.joined_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center">
                            <Eye size={12} className="mr-1" /> Views
                        </div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">{lead.views.length} cars</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center">
                            <Heart size={12} className="mr-1 text-red-500" /> Favs
                        </div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">{lead.favorites.length}</div>
                    </div>
                </div>
                {expandedUser === lead.id ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedUser === lead.id && (
              <div className="px-8 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Views Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                        <Eye size={16} className="mr-2" /> Top Viewed Cars
                    </h4>
                    <div className="space-y-3">
                      {lead.views.length > 0 ? lead.views.map((v) => (
                        <div key={v.car_id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all group">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                                {v.photo && <img src={v.photo} className="w-full h-full object-cover" alt={v.model} />}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{v.brand} {v.model}</div>
                                <div className="text-xs text-blue-500 flex items-center">
                                    <Hash size={10} className="mr-1" /> {v.count} times viewed
                                </div>
                            </div>
                          </div>
                          <a href={`/cars/${v.car_id}`} target="_blank" className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-500 transition-all">
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      )) : <p className="text-sm text-gray-500 italic">No car views recorded yet.</p>}
                    </div>
                  </div>

                  {/* Favorites Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                        <Heart size={16} className="mr-2 text-red-500" /> Wishlist / Favorites
                    </h4>
                    <div className="space-y-3">
                    {lead.favorites.length > 0 ? lead.favorites.map((f) => (
                        <div key={f.car_id} className="flex items-center justify-between p-3 bg-red-500/5 dark:bg-red-500/5 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all group">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                                {f.photo && <img src={f.photo} className="w-full h-full object-cover" alt={f.model} />}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">{f.brand} {f.model}</div>
                                <div className="text-xs text-gray-500">
                                    {f.year} • {f.price ? `${f.price.toLocaleString()}€` : "Price hidden"}
                                </div>
                            </div>
                          </div>
                          <a href={`/cars/${f.car_id}`} target="_blank" className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all">
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      )) : <p className="text-sm text-gray-500 italic">No cars favorited yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {leads.length === 0 && (
          <div className="text-center py-20 bg-gray-900/10 rounded-3xl border border-dashed border-gray-800">
            <p className="text-gray-500">No active leads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
