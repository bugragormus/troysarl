import { ReactNode, useState } from "react";
import { LayoutDashboard, Car, Receipt, Users, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
}

export default function AdminLayout({ children, activeTab, setActiveTab, handleLogout }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Car },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-white dark:bg-gradient-to-b from-premium-light to-premium-dark text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Mobile Toggle Button - Moved to Left to avoid WhatsApp clash */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 left-6 z-[110] p-4 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 hover:scale-110 active:scale-95 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[105]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-[110] lg:z-50
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 w-64 lg:w-20"}
          bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden
        `}
      >
        <div className="p-6 flex items-center h-20 border-b border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="min-w-[32px] w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              T
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 text-gray-800 dark:text-white">
                TROY ADMIN
              </span>
            )}
          </div>
          
          {/* Desktop Toggle Button - More integrated look */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-12 p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-blue-600 hover:border-blue-500 transition-all text-gray-400 hover:text-white shadow-sm"
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-xl transition-all group relative ${
                activeTab === item.id 
                  ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white border border-transparent"
              }`}
            >
              <item.icon size={22} className={`${activeTab === item.id ? "text-blue-600 dark:text-blue-400" : "group-hover:scale-110 transition-transform"} ${!isSidebarOpen && "lg:mx-auto"}`} />
              {isSidebarOpen && (
                <span className="ml-4 font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                  {item.label}
                </span>
              )}
              {activeTab === item.id && isSidebarOpen && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
              )}
              
              {!isSidebarOpen && activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800/50 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut size={22} className={`group-hover:-translate-x-1 transition-transform ${!isSidebarOpen && "lg:mx-auto"}`} />
            {isSidebarOpen && <span className="ml-4 font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto relative selection:bg-blue-500/30">
        {/* Top Glow - Only visible in dark mode or subtle in light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.03] dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/[0.03] dark:bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="p-4 md:p-10 relative z-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
