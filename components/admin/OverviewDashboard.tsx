import { useState } from "react";
import { TrendingUp, Car, Users, Briefcase, Activity, Flame, Download, Send, ShieldCheck, Zap, Eye, X } from "lucide-react";
import { AdminStats, UserProfile, FavoriteStat, PageViewStat } from "@/hooks/useAdminData";
import CarType from "@/types/car";
import toast from "react-hot-toast";
import Modal from "react-modal";

interface OverviewDashboardProps {
  stats: AdminStats;
  profiles: UserProfile[];
  cars: CarType[];
  hotLeads: FavoriteStat[];
  trendingTraffic: PageViewStat[];
}

export default function OverviewDashboard({ stats, profiles, cars, hotLeads, trendingTraffic }: OverviewDashboardProps) {
  const cards = [
    { label: "Total Inventory", value: stats.totalCars, icon: Car, color: "blue" },
    { label: "Live Listings", value: stats.liveListings, icon: Activity, color: "green" },
    { label: "Registered Users", value: stats.totalUsers, icon: Users, color: "purple" },
    { label: "Marketing Leads", value: stats.marketingOptInCount, icon: Briefcase, color: "indigo" },
  ];

  // Internal state for Newsletter Modal
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState("Troy Cars SARL - Exclusive New Arrivals & VIP Offers");
  const [newsletterBody, setNewsletterBody] = useState(
    "Hello!\n\n" +
    "We have some exciting new luxury vehicles in our collection that we thought you'd love to see.\n\n" +
    "Check out our latest inventory here: https://troysarl.com/cars\n\n" +
    "If you're interested in a private viewing or have any questions about a specific model, feel free to contact us at info@troysarl.com.\n\n" +
    "Best regards,\n" +
    "Ufuk - Troy Cars SARL"
  );

  // Action Handlers
  const handleSendNewsletter = () => {
    const optedInEmails = profiles
      .filter(p => p.marketing_consent)
      .map(p => p.phone || ""); // Note: Schema uses 'phone', using it as a placeholder for contact.
    
    const validContacts = optedInEmails.filter(e => e.length > 0);
    
    if (validContacts.length === 0) {
      toast.error("No users opted in for marketing.");
      return;
    }
    
    setIsNewsletterModalOpen(true);
  };

  const executeNewsletterDispatch = async () => {
    setIsSending(true);
    const toastId = toast.loading("Dispatching VIP Newsletter...");
    try {
      // In production, you might want to convert newline to <br/> for HTML body, or just put it in a <pre> tag.
      const htmlBody = newsletterBody.replace(/\n/g, "<br/>");

      const response = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newsletterSubject,
          htmlBody: htmlBody,
          testMode: false // Change to true to only send to the first user for safety during testing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send newsletter.");
      }

      toast.success(data.message || "Newsletter successfully dispatched!", { id: toastId });
      setIsNewsletterModalOpen(false);
    } catch (error: any) {
      toast.error(`Dispatch Failed: ${error.message}`, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  const handleExportData = () => {
    if (cars.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }

    // Creating CSV header
    const headers = ["ID", "Brand", "Model", "Year", "Price", "Mileage", "Listing Type", "Created At"];
    
    // Mapping cars to CSV rows
    const rows = cars.map(car => [
      car.id,
      `"${car.brand}"`,
      `"${car.model}"`,
      car.year,
      car.price,
      car.mileage,
      car.listing_type,
      car.created_at ? new Date(car.created_at).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const exportFileDefaultName = `troy_cars_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    toast.success("Inventory report exported as CSV (Excel compatible).");
  };

  const handleSystemCheck = async () => {
    const toastId = toast.loading('Pinging database and checking core services...');
    
    try {
      const response = await fetch('/api/system-health');
      const data = await response.json();
      
      if (response.ok && data.status === "healthy") {
        toast.success(`System operational. Latency: ${data.responseTimeMs}ms`, { id: toastId });
      } else {
        throw new Error(data.message || "Health check failed");
      }
    } catch (error: any) {
      toast.error(`System anomaly detected: ${error.message}`, { id: toastId });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:to-gray-400">
            Welcome Back, Ufuk
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Here&apos;s a quick look at Troy Cars SARL performance.</p>
        </div>
        <div className="flex items-center px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 text-sm font-medium">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
          System Live
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className="group p-6 bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-3xl backdrop-blur-sm hover:border-gray-200 dark:hover:border-gray-700/50 transition-all hover:bg-white/60 dark:hover:bg-gray-800/40 shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${card.color}-500/10 border border-${card.color}-500/20 group-hover:scale-110 transition-transform`}>
                <card.icon className={`text-${card.color}-400`} size={24} />
              </div>
            </div>
            <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Analytics (Hot Leads + Traffic) */}
        <div className="space-y-6">
            <div className="p-8 bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-4xl backdrop-blur-md relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                    <Flame size={20} className="text-orange-500 mr-3" />
                    Hot Leads: Most Favorited
                </h3>
                
                <div className="space-y-4">
                  {hotLeads.length > 0 ? (
                    hotLeads.map((lead, idx) => {
                      const car = cars.find(c => c.id === lead.car_id);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-700 overflow-hidden relative">
                               {car?.photos?.[0] ? (
                                 <img src={car.photos[0]} alt="Car" className="w-full h-full object-cover" />
                               ) : (
                                 <Car size={20} className="absolute inset-0 m-auto text-gray-500" />
                               )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">
                                {car ? `${car.brand} ${car.model}` : "Unknown Car"}
                              </p>
                              <p className="text-xs text-gray-500">Inventory ID: {lead.car_id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-orange-400 font-bold">
                            <TrendingUp size={14} className="mr-2" />
                            {lead.count} Likes
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 italic">
                       No favorites recorded yet.
                    </div>
                  )}
                </div>
            </div>

            <div className="p-8 bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-4xl backdrop-blur-md relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                    <Eye size={20} className="text-blue-500 mr-3" />
                    Trending Traffic: Most Viewed
                </h3>
                
                <div className="space-y-4">
                  {trendingTraffic.length > 0 ? (
                    trendingTraffic.map((view, idx) => {
                      const car = cars.find(c => c.id === view.car_id);
                      return (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-700 overflow-hidden relative">
                               {car?.photos?.[0] ? (
                                 <img src={car.photos[0]} alt="Car" className="w-full h-full object-cover" />
                               ) : (
                                 <Car size={20} className="absolute inset-0 m-auto text-gray-500" />
                               )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">
                                {car ? `${car.brand} ${car.model}` : "Unknown Car"}
                              </p>
                              <p className="text-xs text-gray-500">Inventory ID: {view.car_id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-blue-400 font-bold tracking-tight">
                            <Eye size={16} className="mr-2" />
                            {view.count} Views
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 italic">
                       No views recorded yet.
                    </div>
                  )}
                </div>
            </div>
        </div>
        
        {/* Action Hub */}
        <div className="p-8 bg-white/40 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-4xl backdrop-blur-md relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
                <Zap size={20} className="text-emerald-500 mr-3" />
                Quick Actions Hub
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleSendNewsletter}
                  className="p-6 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-blue-600/10 dark:hover:bg-blue-600/20 hover:border-blue-500/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 text-sm font-bold transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center gap-3 group/btn hover:text-blue-600 dark:hover:text-blue-400 shadow-sm overflow-hidden"
                >
                    <Send className="text-blue-400 group-hover/btn:scale-110 transition-transform" />
                    Send VIP Newsletter
                </button>
                <button 
                  onClick={handleExportData}
                  className="p-6 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-emerald-600/10 dark:hover:bg-emerald-600/20 hover:border-emerald-500/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 text-sm font-bold transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center gap-3 group/btn hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm overflow-hidden"
                >
                    <Download className="text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                    Export All Reports
                </button>
                <button 
                  onClick={handleSystemCheck}
                  className="p-6 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-600/10 dark:hover:bg-purple-600/20 hover:border-purple-500/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 text-sm font-bold transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center gap-3 group/btn hover:text-purple-600 dark:hover:text-purple-400 shadow-sm overflow-hidden"
                >
                    <ShieldCheck className="text-purple-400 group-hover/btn:scale-110 transition-transform" />
                    Check System Health
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="p-6 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-orange-600/10 dark:hover:bg-orange-600/20 hover:border-orange-500/50 rounded-3xl border border-gray-100 dark:border-gray-700/50 text-sm font-bold transition-all text-gray-600 dark:text-gray-300 flex flex-col items-center justify-center gap-3 group/btn hover:text-orange-600 dark:hover:text-orange-400 shadow-sm overflow-hidden"
                >
                    <Zap className="text-orange-400 group-hover/btn:scale-110 transition-transform" />
                    Clear Dashboard Cache
                </button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
              <p className="text-xs text-blue-400 leading-relaxed">
                <span className="font-bold">Pro Tip:</span> Newsletters are sent via the Resend API. Exported reports are in universal JSON format compatible with Excel.
              </p>
            </div>
        </div>
      </div>

      {/* Newsletter Dispatch Modal */}
      <Modal
        isOpen={isNewsletterModalOpen}
        onRequestClose={() => !isSending && setIsNewsletterModalOpen(false)}
        className="outline-none"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          content: {
            position: "relative",
            background: "transparent",
            inset: "auto",
            border: "none",
            padding: 0,
            width: "100%",
            maxWidth: "600px"
          }
        }}
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
            <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
              <Send className="mr-3 text-blue-500" size={24} />
              Dispatch VIP Newsletter
            </h2>
            <button 
              onClick={() => setIsNewsletterModalOpen(false)}
              disabled={isSending}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
              This email will be dispatched to <strong>{stats.marketingOptInCount}</strong> opted-in VIP users.
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject Line</label>
              <input 
                type="text" 
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white disabled:opacity-50 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Body (HTML / Text)</label>
              <textarea 
                value={newsletterBody}
                onChange={(e) => setNewsletterBody(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white h-48 resize-y disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-2">Line breaks will be automatically converted to HTML &lt;br/&gt; tags.</p>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end space-x-3">
            <button 
              onClick={() => setIsNewsletterModalOpen(false)}
              disabled={isSending}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={executeNewsletterDispatch}
              disabled={isSending || !newsletterSubject.trim() || !newsletterBody.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 flex items-center disabled:opacity-50 disabled:shadow-none"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
