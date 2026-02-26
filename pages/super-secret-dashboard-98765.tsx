import { useEffect, useState } from "react";
import Car from "@/types/car";
import toast, { Toaster } from "react-hot-toast";
import * as Sentry from "@sentry/react";
import TransactionManager from "@/components/admin/TransactionManager";
import CarFormModal from "@/components/admin/CarFormModal";
import CarList from "@/components/admin/CarList";
import { useCars } from "@/hooks/useCars";
import { useAdminData } from "@/hooks/useAdminData";
import AdminLayout from "@/components/admin/AdminLayout";
import OverviewDashboard from "@/components/admin/OverviewDashboard";
import UserManagement from "@/components/admin/UserManagement";
import ContentManager from "@/components/admin/ContentManager";
import LeadInsights from "@/components/admin/LeadInsights";
import { HardDrive, RefreshCcw, LineChart } from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Stats & Master Data
  const { stats, profiles, cars: allCars, transactions, hotLeads, trendingTraffic, loading: adminLoading, fetchAdminData } = useAdminData();

  // Inventory Management
  const { 
    cars, 
    fetchCars, 
    removeCar, 
    toggleVisibility, 
    updateListingType 
  } = useCars(true);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    fetchCars();
    fetchAdminData();
  }, [fetchCars, fetchAdminData]);

  const handleLogout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/admin-login";
  };

  const handleEditClick = (car: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewDashboard stats={stats} profiles={profiles} cars={allCars} transactions={transactions} hotLeads={hotLeads} trendingTraffic={trendingTraffic} />;
      case "inventory":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <p className="text-gray-400 text-sm">Update listings, manage photos, and toggle visibility.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20"
              >
                + New Arrival
              </button>
            </div>

            <CarList
              cars={cars}
              onEdit={handleEditClick}
              onDelete={async (id) => {
                  await removeCar(id);
                  fetchAdminData();
              }}
              onToggleVisibility={toggleVisibility}
              onUpdateListingType={updateListingType}
            />
          </div>
        );
      case "content":
        return <ContentManager />;
      case "transactions":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TransactionManager 
                cars={cars} 
                onSuccess={() => fetchAdminData()} 
            />
          </div>
        );
      case "users":
        return <UserManagement profiles={profiles} />;
      case "insights":
        return <LeadInsights />;
      case "settings":
        return (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold underline decoration-blue-500 decoration-4 underline-offset-8">System Settings</h2>
            </div>
            
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 space-y-4">
              <div className="flex items-center space-x-3 text-amber-500">
                <HardDrive size={24} />
                <h3 className="text-lg font-bold">Maintenance: Photo Migration</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Migrate legacy Supabase storage photos to Cloudinary CDN for better performance and global delivery.
              </p>
              <button
                disabled={true}
                className="flex items-center px-6 py-3 bg-gray-600 cursor-not-allowed opacity-50 text-white font-bold rounded-xl transition-all"
              >
                <RefreshCcw size={18} className="mr-2" />
                Migration Completed
              </button>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-4">Admin Security</h3>
                <p className="text-gray-400 text-sm mb-6">Current session will expire in 24 hours. For security, always logout after use.</p>
                <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-xs font-mono text-gray-500">
                    System Version: 2.1.0-STABLE<br/>
                    Last Build: {new Date().toLocaleDateString()}<br/>
                    Node Environment: production
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout}>
      <div className="relative">
        {renderContent()}

        <CarFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCar(null);
          }}
          carToEdit={editingCar}
          onSuccess={() => {
              fetchCars();
              fetchAdminData();
          }}
        />
      </div>
    </AdminLayout>
  );
}
